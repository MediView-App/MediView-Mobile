import { useEffect, useRef, useState } from "react";
import { View, Pressable, StyleSheet, Alert, Linking, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { palette } from "@/theme/tokens";
import { WS_URL, HAS_TURN } from "@/lib/config";
import { getWsTicket } from "@/api/ws";
import {
  startConsult,
  RTCVideo,
  type ConsultHandle,
  type ConsultStatus,
  type StreamLike,
} from "@/lib/webrtc";

const statusLabel: Record<ConsultStatus, string> = {
  connecting: "연결 중…",
  waiting: "상대를 기다리는 중…",
  connected: "연결됨",
  reconnecting: "연결이 불안정해요. 다시 연결 중…",
  ended: "종료됨",
  failed: "연결에 실패했어요",
  "permission-denied": "카메라·마이크 권한이 필요해요",
  unavailable: "이 기기에서는 영상 진료를 사용할 수 없어요",
};

/** 실제 WebRTC 화상 진료 화면(네이티브 개발 빌드에서 동작). */
export function VideoConsult({
  sessionId,
  doctorName = "의료진",
  onEnd,
  onChat,
}: {
  sessionId: string;
  doctorName?: string;
  onEnd: () => void;
  /** 화상 연결 실패 시 채팅으로 전환하는 폴백(선택). */
  onChat?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const handleRef = useRef<ConsultHandle | null>(null);

  const [status, setStatus] = useState<ConsultStatus>("connecting");
  const [remote, setRemote] = useState<StreamLike | null>(null);
  const [local, setLocal] = useState<StreamLike | null>(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [relay, setRelay] = useState(false);
  const [sec, setSec] = useState(0);
  const [startNonce, setStartNonce] = useState(0);

  // 세션 시작. startNonce 를 바꾸면 완전히 새로 연결한다(권한 재요청 등).
  useEffect(() => {
    let handle: ConsultHandle | null = null;
    let cancelled = false;
    setStatus("connecting");
    setRemote(null);
    (async () => {
      let ticket: string | null = null;
      try {
        ticket = await getWsTicket();
      } catch {
        // 티켓 발급 실패 — 티켓 없이 시도(백엔드가 거부하면 상태 머신이 처리).
        ticket = null;
      }
      if (cancelled) return;
      handle = startConsult({
        roomId: sessionId,
        wsUrl: WS_URL,
        ticket,
        onLocalStream: setLocal,
        onRemoteStream: setRemote,
        onStatus: setStatus,
        onQuality: (q) => setRelay(q.relay),
      });
      handleRef.current = handle;
    })();
    return () => {
      cancelled = true;
      handle?.hangup();
      handleRef.current = null;
    };
  }, [sessionId, startNonce]);

  // 통화 시간은 '연결된 동안'만 흐른다. 재연결 중에는 멈추고, 복구되면 이어서 센다.
  useEffect(() => {
    if (status !== "connected") return;
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  const confirmEnd = () => {
    Alert.alert("진료를 종료할까요?", "연결이 끊기고 진료 요약 화면으로 이동합니다.", [
      { text: "계속하기", style: "cancel" },
      {
        text: "종료",
        style: "destructive",
        onPress: () => {
          handleRef.current?.hangup();
          onEnd();
        },
      },
    ]);
  };

  const retry = (voiceOnly = false) => {
    if (voiceOnly) {
      handleRef.current?.toggleCam(false);
      setCamOff(true);
    }
    if (handleRef.current) handleRef.current.restart();
    else setStartNonce((n) => n + 1); // 초기화 실패 상태 → 세션 재시작
  };

  const isError =
    status === "failed" || status === "permission-denied" || status === "unavailable";

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* 원격 영상 */}
      {remote ? (
        <RTCVideo stream={remote} style={StyleSheet.absoluteFill} objectFit="cover" />
      ) : (
        <View style={styles.placeholder}>
          <View style={styles.remoteAvatar}>
            <Text variant="display" style={{ color: "rgba(255,255,255,0.9)", fontSize: 44 }}>
              {doctorName.charAt(0)}
            </Text>
          </View>
          <Text variant="body" style={{ color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
            {statusLabel[status]}
          </Text>
        </View>
      )}

      {/* 상단 상태 + 품질 */}
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <View
          style={styles.pill}
          accessibilityRole="text"
          accessibilityLabel={
            status === "connected" ? `연결됨, 통화 시간 ${mm}분 ${ss}초` : statusLabel[status]
          }
        >
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  status === "connected"
                    ? "#3BD07A"
                    : status === "reconnecting"
                    ? palette.warning
                    : palette.accent[500],
              },
            ]}
          />
          <Text variant="caption" style={{ color: "#fff" }}>
            {status === "connected" ? `${mm}:${ss}` : statusLabel[status]}
          </Text>
        </View>
        {status === "connected" && relay ? (
          <View style={styles.pill} accessibilityLabel="중계 서버 경유 연결">
            <Ionicons name="git-network-outline" size={13} color="rgba(255,255,255,0.85)" />
            <Text variant="caption" style={{ color: "rgba(255,255,255,0.85)" }}>
              중계
            </Text>
          </View>
        ) : null}
      </View>

      {/* 재연결 배너 */}
      {status === "reconnecting" ? (
        <View style={[styles.reconnectBanner, { top: insets.top + 52 }]} accessibilityRole="alert">
          <ActivityIndicator size="small" color="#fff" />
          <Text variant="caption" style={{ color: "#fff" }}>
            연결이 불안정해 다시 연결하고 있어요…
          </Text>
        </View>
      ) : null}

      {/* 자기 화면 PiP */}
      <View style={[styles.pip, { top: insets.top + 60 }]}>
        {local && !camOff ? (
          <RTCVideo stream={local} style={StyleSheet.absoluteFill} mirror objectFit="cover" />
        ) : (
          <Ionicons name="videocam-off" size={22} color="rgba(255,255,255,0.7)" />
        )}
      </View>

      {/* 실패/권한/미지원 오버레이 — 폴백 액션 제공 */}
      {isError ? (
        <View style={styles.overlay}>
          <Ionicons
            name={
              status === "permission-denied"
                ? "camera-outline"
                : status === "unavailable"
                ? "phone-portrait-outline"
                : "cloud-offline-outline"
            }
            size={40}
            color="rgba(255,255,255,0.9)"
          />
          <Text variant="h3" style={{ color: "#fff", marginTop: 14, textAlign: "center" }}>
            {statusLabel[status]}
          </Text>
          <Text
            variant="small"
            style={{ color: "rgba(255,255,255,0.7)", marginTop: 8, textAlign: "center" }}
          >
            {status === "permission-denied"
              ? "설정에서 카메라와 마이크를 허용한 뒤 다시 시도해 주세요."
              : status === "unavailable"
              ? "앱을 최신 버전으로 업데이트하거나 채팅으로 진료를 이어갈 수 있어요."
              : HAS_TURN
              ? "네트워크 상태를 확인하고 다시 연결하거나, 채팅으로 전환할 수 있어요."
              : "네트워크가 불안정합니다. Wi‑Fi 로 전환 후 다시 시도해 주세요."}
          </Text>

          <View style={styles.overlayActions}>
            {status === "permission-denied" ? (
              <OverlayBtn
                icon="settings-outline"
                label="설정 열기"
                onPress={() => Linking.openSettings()}
              />
            ) : null}
            {status !== "unavailable" ? (
              <OverlayBtn
                icon="refresh"
                label="다시 연결"
                primary
                onPress={() => retry(false)}
              />
            ) : null}
            {status === "failed" ? (
              <OverlayBtn
                icon="mic-outline"
                label="음성으로 다시 시도"
                onPress={() => retry(true)}
              />
            ) : null}
            {onChat ? (
              <OverlayBtn icon="chatbubble-ellipses-outline" label="채팅으로 전환" onPress={onChat} />
            ) : null}
            <OverlayBtn icon="close" label="진료 종료" onPress={onEnd} />
          </View>
        </View>
      ) : null}

      {/* 컨트롤 */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        <Ctrl
          icon={muted ? "mic-off" : "mic"}
          active={muted}
          label={muted ? "마이크 켜기" : "마이크 끄기"}
          onPress={() => setMuted(handleRef.current?.toggleMic() ?? false)}
        />
        <Ctrl
          icon={camOff ? "videocam-off" : "videocam"}
          active={camOff}
          label={camOff ? "카메라 켜기" : "카메라 끄기"}
          onPress={() => setCamOff(handleRef.current?.toggleCam() ?? false)}
        />
        <Pressable
          onPress={confirmEnd}
          style={styles.endBtn}
          accessibilityRole="button"
          accessibilityLabel="진료 종료"
        >
          <Ionicons
            name="call"
            size={26}
            color="#fff"
            style={{ transform: [{ rotate: "135deg" }] }}
          />
        </Pressable>
      </View>
    </View>
  );
}

function Ctrl({
  icon,
  active,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      style={[styles.ctrl, { backgroundColor: active ? "#fff" : "rgba(255,255,255,0.16)" }]}
    >
      <Ionicons name={icon} size={24} color={active ? palette.neutral[900] : "#fff"} />
    </Pressable>
  );
}

function OverlayBtn({
  icon,
  label,
  onPress,
  primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.overlayBtn,
        {
          backgroundColor: primary ? palette.primary[500] : "rgba(255,255,255,0.14)",
        },
      ]}
    >
      <Ionicons name={icon} size={18} color="#fff" />
      <Text variant="bodyStrong" style={{ color: "#fff" }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B1418" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  remoteAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.primary[700],
    alignItems: "center",
    justifyContent: "center",
  },
  topbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  reconnectBanner: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pip: {
    position: "absolute",
    right: 16,
    width: 96,
    height: 132,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    backgroundColor: "rgba(8,18,22,0.92)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  overlayActions: {
    marginTop: 26,
    width: "100%",
    maxWidth: 320,
    gap: 10,
  },
  overlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  controls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    paddingTop: 20,
  },
  ctrl: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  endBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.danger,
    alignItems: "center",
    justifyContent: "center",
  },
});
