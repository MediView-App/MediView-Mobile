import React from "react";
import { Signaling } from "./signaling";
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

const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export function startConsult(opts: StartConsultOpts): ConsultHandle {
  if (!WEBRTC_AVAILABLE) {
    return { toggleMic: () => false, toggleCam: () => false, hangup: () => {} };
  }

  const pc = new RN.RTCPeerConnection(ICE);
  let localStream: any = null;
  let signaling: Signaling | null = null;
  let closed = false;

  const cleanup = () => {
    closed = true;
    try {
      localStream?.getTracks?.().forEach((t: any) => t.stop());
    } catch {}
    try {
      pc.close();
    } catch {}
    signaling?.close();
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
  pc.onconnectionstatechange = () => {
    const st = pc.connectionState;
    if (st === "connected") opts.onStatus?.("connected");
    else if (st === "failed" || st === "disconnected") opts.onStatus?.("error");
  };

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
        const offer = await pc.createOffer({});
        await pc.setLocalDescription(offer);
        signaling!.send("offer", offer);
      });
      signaling.on("offer", async (m) => {
        await pc.setRemoteDescription(new RN.RTCSessionDescription(m.payload as any));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        signaling!.send("answer", answer);
      });
      signaling.on("answer", async (m) => {
        await pc.setRemoteDescription(new RN.RTCSessionDescription(m.payload as any));
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
        () => opts.onStatus?.("error")
      );
    } catch {
      opts.onStatus?.("error");
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
