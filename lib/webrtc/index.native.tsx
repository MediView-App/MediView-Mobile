import React from "react";
import { Signaling } from "./signaling";
import { ICE_SERVERS } from "@/lib/config";
import type { StartConsultOpts, ConsultHandle, RTCVideoProps } from "./types";

/**
 * 네이티브 실제 WebRTC 구현.
 * react-native-webrtc 는 네이티브 모듈이라 Expo Go 에는 링크되어 있지 않다.
 * 따라서 top-level import 대신 lazy require 로 감싸고, 로드 실패 시 비활성 처리한다.
 * (실제 동작하려면 expo-dev-client 기반 개발 빌드가 필요하다.)
 */
let RN: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RN = require("react-native-webrtc");
} catch {
  RN = null;
}

export const WEBRTC_AVAILABLE: boolean = !!(RN && RN.RTCPeerConnection);

// STUN 만으로는 대칭형 NAT 에서 P2P 가 실패한다. 인프라 coturn(TURN)까지 함께 사용.
const ICE = { iceServers: ICE_SERVERS };

const MAX_RECONNECT = 3;

/** getUserMedia 오류가 권한 거부인지 판별. */
function isPermissionError(err: any): boolean {
  const name = err?.name || "";
  const msg = String(err?.message || "").toLowerCase();
  return (
    name === "NotAllowedError" ||
    name === "SecurityError" ||
    name === "PermissionDeniedError" ||
    msg.includes("permission") ||
    msg.includes("denied")
  );
}

export function startConsult(opts: StartConsultOpts): ConsultHandle {
  if (!WEBRTC_AVAILABLE) {
    opts.onStatus?.("unavailable");
    return {
      toggleMic: () => false,
      toggleCam: () => false,
      restart: () => {},
      hangup: () => {},
    };
  }

  const pc = new RN.RTCPeerConnection(ICE);
  let localStream: any = null;
  let signaling: Signaling | null = null;
  let closed = false;
  let isOfferer = false;
  let negotiating = false;
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const cleanup = () => {
    closed = true;
    clearReconnectTimer();
    try {
      localStream?.getTracks?.().forEach((t: any) => t.stop());
    } catch {}
    try {
      pc.close();
    } catch {}
    signaling?.close();
  };

  /** 연결 성공 시 릴레이(TURN) 경유 여부를 best-effort 로 판별해 품질 신호를 보낸다. */
  const reportQuality = async () => {
    if (!opts.onQuality) return;
    try {
      const stats = await pc.getStats();
      const byId = new Map<string, any>();
      let pair: any = null;
      stats.forEach((report: any) => {
        byId.set(report.id, report);
        if (
          report.type === "candidate-pair" &&
          (report.nominated || report.selected) &&
          report.state === "succeeded"
        ) {
          pair = report;
        }
      });
      let relay = false;
      if (pair) {
        const local = byId.get(pair.localCandidateId);
        if (local && local.candidateType === "relay") relay = true;
      }
      opts.onQuality({ relay });
    } catch {
      // 통계 파싱 실패는 무시(표시용 신호일 뿐).
    }
  };

  /** ICE restart 로 재협상(offerer 전용). 동시 협상은 negotiating 으로 차단. */
  const doIceRestart = async () => {
    if (closed || negotiating) return;
    negotiating = true;
    try {
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      signaling?.send("offer", offer);
    } catch {
      // 재협상 실패 → 상태 머신이 다음 실패 이벤트에서 처리.
    } finally {
      negotiating = false;
    }
  };

  /** 단절 감지 시 자동 복구 스케줄. */
  const scheduleReconnect = () => {
    if (closed) return;
    if (reconnectAttempts >= MAX_RECONNECT) {
      opts.onStatus?.("failed");
      return;
    }
    opts.onStatus?.("reconnecting");
    clearReconnectTimer();
    const delay = 1500 * (reconnectAttempts + 1); // 1.5s, 3s, 4.5s
    reconnectTimer = setTimeout(() => {
      if (closed) return;
      const st = pc.iceConnectionState;
      if (st === "connected" || st === "completed") return; // 스스로 회복됨
      reconnectAttempts += 1;
      // offerer 가 재협상을 주도한다. answerer 는 상대의 새 offer 를 기다린다.
      if (isOfferer) doIceRestart();
    }, delay);
  };

  opts.onStatus?.("connecting");

  pc.ontrack = (e: any) => {
    if (e.streams && e.streams[0]) opts.onRemoteStream?.(e.streams[0]);
  };
  // 구버전 호환
  pc.onaddstream = (e: any) => {
    if (e.stream) opts.onRemoteStream?.(e.stream);
  };
  pc.onicecandidate = (e: any) => {
    if (e.candidate) signaling?.send("ice-candidate", e.candidate);
  };

  const onStateChange = () => {
    const st = pc.iceConnectionState || pc.connectionState;
    if (st === "connected" || st === "completed") {
      clearReconnectTimer();
      reconnectAttempts = 0;
      opts.onStatus?.("connected");
      reportQuality();
    } else if (st === "disconnected") {
      // 일시 단절 — 잠깐 스스로 회복될 수 있으니 지연 후 복구 시도.
      scheduleReconnect();
    } else if (st === "failed") {
      // 즉시 복구 시도(회복 여지 낮음).
      if (reconnectAttempts >= MAX_RECONNECT) {
        opts.onStatus?.("failed");
      } else {
        opts.onStatus?.("reconnecting");
        reconnectAttempts += 1;
        if (isOfferer) doIceRestart();
        else scheduleReconnect();
      }
    }
  };
  pc.oniceconnectionstatechange = onStateChange;
  pc.onconnectionstatechange = onStateChange;

  (async () => {
    try {
      localStream = await RN.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: "user" },
      });
      if (closed) return;
      opts.onLocalStream?.(localStream);
      localStream.getTracks().forEach((t: any) => pc.addTrack(t, localStream));

      signaling = new Signaling(opts.wsUrl, opts.roomId, opts.ticket);

      // 이미 방에 있던 쪽이 상대 입장 시 offer 를 생성한다(2인 통화 규약).
      signaling.on("peer-joined", async () => {
        isOfferer = true;
        try {
          const offer = await pc.createOffer({});
          await pc.setLocalDescription(offer);
          signaling!.send("offer", offer);
        } catch {
          opts.onStatus?.("failed");
        }
      });
      signaling.on("offer", async (m) => {
        try {
          await pc.setRemoteDescription(new RN.RTCSessionDescription(m.payload as any));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          signaling!.send("answer", answer);
        } catch {
          // 재협상 offer 처리 실패 → 다음 상태 이벤트에서 복구.
        }
      });
      signaling.on("answer", async (m) => {
        try {
          await pc.setRemoteDescription(new RN.RTCSessionDescription(m.payload as any));
        } catch {}
      });
      signaling.on("ice-candidate", async (m) => {
        try {
          await pc.addIceCandidate(new RN.RTCIceCandidate(m.payload as any));
        } catch {}
      });
      signaling.on("peer-left", () => {
        opts.onRemoteStream?.(null);
        opts.onStatus?.("waiting");
      });

      signaling.connect(
        () => opts.onStatus?.("waiting"),
        () => {
          if (!closed) opts.onStatus?.("ended");
        },
        () => {
          // 시그널링 소켓 오류는 곧 상태 이벤트로 이어짐 — 재연결 스케줄.
          if (!closed) scheduleReconnect();
        }
      );
    } catch (err) {
      if (isPermissionError(err)) opts.onStatus?.("permission-denied");
      else opts.onStatus?.("failed");
    }
  })();

  const setTrack = (kind: "audio" | "video", on?: boolean): boolean => {
    const track =
      kind === "audio"
        ? localStream?.getAudioTracks?.()[0]
        : localStream?.getVideoTracks?.()[0];
    if (!track) return false;
    const enable = on ?? !track.enabled;
    track.enabled = enable;
    return !enable; // '꺼짐' 여부
  };

  return {
    toggleMic: (on) => setTrack("audio", on),
    toggleCam: (on) => setTrack("video", on),
    restart: () => {
      if (closed) return;
      reconnectAttempts = 0;
      opts.onStatus?.("reconnecting");
      // 수동 재시도는 사용자 조작이라 글레어 위험이 낮다. 어느 쪽이든 재협상 주도.
      isOfferer = true;
      doIceRestart();
    },
    hangup: () => {
      signaling?.send("leave", {});
      cleanup();
      opts.onStatus?.("ended");
    },
  };
}

export function RTCVideo({ stream, style, mirror, objectFit = "cover" }: RTCVideoProps) {
  if (!RN?.RTCView || !stream) return null;
  const url = (stream as any)?.toURL ? (stream as any).toURL() : undefined;
  return (
    <RN.RTCView
      streamURL={url}
      style={style}
      mirror={mirror}
      objectFit={objectFit}
      zOrder={0}
    />
  );
}
