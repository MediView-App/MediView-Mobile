import { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { palette } from "@/theme/tokens";
import { doctors } from "@/lib/mock";
import { WEBRTC_AVAILABLE } from "@/lib/webrtc";
import { VideoConsult } from "@/components/VideoConsult";

export default function Consult() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const doctor = doctors.find((d) => d.id === id) ?? doctors[0];

  const [sec, setSec] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  // 네이티브 개발 빌드에서 react-native-webrtc 가 링크된 경우 실제 영상 진료를 사용한다.
  if (WEBRTC_AVAILABLE) {
    return (
      <VideoConsult
        sessionId={String(id)}
        doctorName={doctor.name}
        onEnd={() => router.replace(`/summary/${id}`)}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* 미리보기 안내(Expo Go/웹) */}
      <View style={[styles.previewBanner, { top: insets.top + 52 }]}>
        <Ionicons name="information-circle" size={14} color="#fff" />
        <Text variant="caption" style={{ color: "rgba(255,255,255,0.9)" }}>
          미리보기 · 실제 영상은 개발 빌드에서 동작
        </Text>
      </View>

      {/* 원격 영상 영역(플레이스홀더) */}
      <View style={styles.remote}>
        <View style={styles.remoteAvatar}>
          <Text variant="display" style={{ color: "rgba(255,255,255,0.9)", fontSize: 44 }}>
            {doctor.name.charAt(0)}
          </Text>
        </View>
        <Text variant="body" style={{ color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
          영상 연결됨
        </Text>
      </View>

      {/* 상단 정보 */}
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.pill}>
          <View style={styles.liveDot} />
          <Text variant="caption" style={{ color: "#fff" }}>
            {mm}:{ss}
          </Text>
        </View>
        <View style={[styles.pill, { gap: 6 }]}>
          <Text variant="caption" style={{ color: "#fff" }}>
            {doctor.name} 의료진
          </Text>
          {/* 어두운 진료실 배경 위 대비 확보 */}
          <Ionicons name="shield-checkmark" size={13} color={palette.primary[200]} />
        </View>
      </View>

      {/* 자기 화면 PiP */}
      <View style={[styles.pip, { top: insets.top + 60 }]}>
        {camOff ? (
          <Ionicons name="videocam-off" size={22} color="rgba(255,255,255,0.7)" />
        ) : (
          <Text variant="bodyStrong" style={{ color: "#fff" }}>
            나
          </Text>
        )}
      </View>

      {/* 컨트롤 */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        <Ctrl
          icon={muted ? "mic-off" : "mic"}
          active={muted}
          onPress={() => setMuted((m) => !m)}
        />
        <Ctrl
          icon={camOff ? "videocam-off" : "videocam"}
          active={camOff}
          onPress={() => setCamOff((c) => !c)}
        />
        <Ctrl icon="chatbubble-ellipses" onPress={() => {}} />
        <Pressable
          onPress={() => router.replace(`/summary/${id}`)}
          style={styles.endBtn}
        >
          <Ionicons name="call" size={26} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
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
      style={[
        styles.ctrl,
        { backgroundColor: active ? "#fff" : "rgba(255,255,255,0.16)" },
      ]}
    >
      <Ionicons name={icon} size={24} color={active ? palette.neutral[900] : "#fff"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B1418" },
  previewBanner: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  remote: { flex: 1, alignItems: "center", justifyContent: "center" },
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
    justifyContent: "space-between",
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
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.accent[500] },
  pip: {
    position: "absolute",
    right: 16,
    width: 96,
    height: 132,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
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
