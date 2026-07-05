import { useEffect, useRef, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { palette } from "@/theme/tokens";
import { WS_URL } from "@/lib/config";
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
  ended: "종료됨",
  error: "연결 오류",
};

/** 실제 WebRTC 화상 진료 화면(네이티브 개발 빌드에서 동작). */
export function VideoConsult({
  sessionId,
  doctorName = "의료진",
  onEnd,
}: {
  sessionId: string;
  doctorName?: string;
  onEnd: () => void;
}) {
  const insets = useSafeAreaInsets();
  const handleRef = useRef<ConsultHandle | null>(null);

  const [status, setStatus] = useState<ConsultStatus>("connecting");
  const [remote, setRemote] = useState<StreamLike | null>(null);
  const [local, setLocal] = useState<StreamLike | null>(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [sec, setSec] = useState(0);

  useEffect(() => {
    let handle: ConsultHandle | null = null;
    (async () => {
      const ticket = await getWsTicket();
      handle = startConsult({
        roomId: sessionId,
        wsUrl: WS_URL,
        ticket,
        onLocalStream: setLocal,
        onRemoteStream: setRemote,
        onStatus: setStatus,
      });
      handleRef.current = handle;
    })();
    return () => {
      handle?.hangup();
      handleRef.current = null;
    };
  }, [sessionId]);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  const hangup = () => {
    handleRef.current?.hangup();
    onEnd();
  };

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

      {/* 상단 상태 */}
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.pill}>
          <View
            style={[
              styles.dot,
              { backgroundColor: status === "connected" ? "#3BD07A" : palette.accent[500] },
            ]}
          />
          <Text variant="caption" style={{ color: "#fff" }}>
            {status === "connected" ? `${mm}:${ss}` : statusLabel[status]}
          </Text>
        </View>
      </View>

      {/* 자기 화면 PiP */}
      <View style={[styles.pip, { top: insets.top + 60 }]}>
        {local && !camOff ? (
          <RTCVideo stream={local} style={StyleSheet.absoluteFill} mirror objectFit="cover" />
        ) : (
          <Ionicons name="videocam-off" size={22} color="rgba(255,255,255,0.7)" />
        )}
      </View>

      {/* 컨트롤 */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        <Ctrl
          icon={muted ? "mic-off" : "mic"}
          active={muted}
          onPress={() => setMuted(handleRef.current?.toggleMic() ?? false)}
        />
        <Ctrl
          icon={camOff ? "videocam-off" : "videocam"}
          active={camOff}
          onPress={() => setCamOff(handleRef.current?.toggleCam() ?? false)}
        />
        <Pressable onPress={hangup} style={styles.endBtn}>
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
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.ctrl, { backgroundColor: active ? "#fff" : "rgba(255,255,255,0.16)" }]}
    >
      <Ionicons name={icon} size={24} color={active ? palette.neutral[900] : "#fff"} />
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
