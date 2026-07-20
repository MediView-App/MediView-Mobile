import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { DEMO_MODE } from "@/lib/config";
import { getQueueStatus, connectQueue, type QueueSocket } from "@/api/appointments";
import { useAppointment } from "@/lib/useAppointment";

export default function WaitingRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const appt = useAppointment(id);

  const [ahead, setAhead] = useState(2); // 내 앞 대기 인원
  const ready = ahead <= 0;

  // 데모: 대기열이 줄어드는 것을 시뮬레이션.
  useEffect(() => {
    if (!DEMO_MODE || ready) return;
    const t = setInterval(() => setAhead((n) => Math.max(0, n - 1)), 4000);
    return () => clearInterval(t);
  }, [ready]);

  // 실서버: 대기 순번을 WebSocket 으로 구독(변경 시 push). 실패하면 폴링으로 폴백.
  useEffect(() => {
    if (DEMO_MODE) return;
    let alive = true;
    let sock: QueueSocket | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    (async () => {
      sock = await connectQueue(String(id), (s) => {
        if (alive) setAhead(Math.max(0, s.position));
      });
      if (sock) return;
      // 폴백: 5초 폴링
      const poll = async () => {
        const s = await getQueueStatus(String(id));
        if (alive && s) setAhead(Math.max(0, s.position));
      };
      poll();
      pollTimer = setInterval(poll, 5000);
    })();

    return () => {
      alive = false;
      sock?.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [id]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.canvas,
        paddingTop: insets.top + spacing.x8,
        paddingBottom: insets.bottom + spacing.x6,
        paddingHorizontal: spacing.x6,
      }}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.x4 }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: ready ? palette.primary[50] : colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {ready ? (
            <Ionicons name="videocam" size={52} color={colors.brand} />
          ) : (
            <Text variant="display" color="brand" style={{ fontSize: 44 }}>
              {ahead}
            </Text>
          )}
        </View>

        <Text variant="h2" center>
          {ready ? "곧 진료가 시작됩니다" : "진료 대기 중"}
        </Text>
        <Text variant="body" color="muted" center style={{ maxWidth: 300 }}>
          {ready
            ? "담당 의료진이 준비되었어요. 입장해 주세요."
            : `내 앞에 ${ahead}명이 대기 중이에요. 잠시만 기다려 주세요.`}
        </Text>

        <Card style={{ width: "100%", flexDirection: "row", alignItems: "center", gap: 12, marginTop: spacing.x4 }}>
          <Avatar name={appt?.doctorName ?? "의료진"} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{appt?.doctorName ?? "담당 의료진"}</Text>
            <Text variant="small" color="muted">
              {appt?.specialty || appt?.organizationName || "비대면 진료"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={[styles.pulse, { backgroundColor: ready ? palette.success : palette.warning }]} />
            <Text variant="caption" color="muted">
              {ready ? "준비됨" : "대기"}
            </Text>
          </View>
        </Card>

        <Text variant="caption" color="subtle" center style={{ marginTop: spacing.x2, lineHeight: 18 }}>
          예상 대기 시간은 실제와 다를 수 있어요. 창을 벗어나도 순서가 되면 알림을 보내드립니다.
        </Text>
      </View>

      <View style={{ gap: spacing.x2 }}>
        <Button
          label={ready ? "진료실 입장" : "대기 중…"}
          full
          disabled={!ready}
          onPress={() => router.replace(`/consult/${id}`)}
        />
        <Button label="예약으로 돌아가기" variant="ghost" full onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pulse: { width: 8, height: 8, borderRadius: 4 },
});
