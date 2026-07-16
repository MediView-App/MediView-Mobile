import { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { useAuth } from "@/context/AuthContext";
import { getDoctorQueue, type DoctorQueueItem } from "@/api/appointments";

export function DoctorHome() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [queue, setQueue] = useState<DoctorQueueItem[]>([]);

  useEffect(() => {
    let alive = true;
    getDoctorQueue()
      .then((q) => alive && setQueue(q))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const waiting = queue.filter((q) => q.status === "WAITING").length;

  return (
    <Screen>
      <View style={styles.rowBetween}>
        <View>
          <Text variant="small" color="muted">
            오늘도 수고하세요 🩺
          </Text>
          <Text variant="h2">{user?.name ?? "의료진"} 선생님</Text>
        </View>
        <Pressable onPress={() => router.push("/notifications")} hitSlop={8} accessibilityLabel="알림">
          <Ionicons name="notifications-outline" size={24} color={colors.content} />
        </Pressable>
      </View>

      {/* 요약 통계 */}
      <View style={{ flexDirection: "row", gap: spacing.x3, marginTop: spacing.x5 }}>
        <Stat label="대기 환자" value={String(waiting)} tone={palette.primary[600]} />
        <Stat label="오늘 완료" value="8" tone={palette.neutral[500]} />
        <Stat label="발급 문서" value="5" tone={palette.accent[500]} />
      </View>

      {/* 진료 대기열 */}
      <View style={[styles.rowBetween, { marginTop: spacing.x8, marginBottom: spacing.x3 }]}>
        <Text variant="h3">진료 대기열</Text>
        <Badge tone="warning" label={`${waiting}명 대기`} />
      </View>

      {queue.length === 0 ? (
        <Card style={{ alignItems: "center", paddingVertical: 32, gap: 8 }}>
          <Ionicons name="cafe-outline" size={30} color={colors.subtle} />
          <Text variant="body" color="muted">
            대기 중인 환자가 없어요.
          </Text>
        </Card>
      ) : (
        <View style={{ gap: spacing.x3 }}>
          {queue.map((q, i) => {
            const name = q.patientName ?? "환자";
            return (
              <Card key={q.appointmentId} style={{ gap: spacing.x3 }}>
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                    <View style={{ position: "relative" }}>
                      <Avatar name={name} />
                      <View
                        style={[
                          styles.order,
                          { backgroundColor: colors.brand, borderColor: colors.surface },
                        ]}
                      >
                        <Text variant="caption" style={{ color: "#fff", fontWeight: "800" }}>
                          {q.queueOrder ?? i + 1}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text variant="bodyStrong">{name}</Text>
                        {q.triage ? <TriageBadge level={q.triage} /> : null}
                      </View>
                      <Text variant="small" color="muted" numberOfLines={1}>
                        {q.chiefComplaint ?? (q.status === "IN_PROGRESS" ? "진료 중" : "문진 미작성")}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button
                    label="진료 시작"
                    style={{ flex: 1 }}
                    onPress={() => router.push(`/consult/${q.appointmentId}`)}
                  />
                  <Button
                    label="문서 발급"
                    variant="secondary"
                    style={{ flex: 1 }}
                    onPress={() => router.push(`/prescribe/${q.appointmentId}`)}
                  />
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

function TriageBadge({ level }: { level: "LOW" | "MEDIUM" | "HIGH" }) {
  // JellySafe 틴트 레시피(배경 -5, 텍스트 -50) — 색만 쓰지 않고 라벨을 함께 표기.
  const map = {
    HIGH: { label: "응급의심", bg: "#FDECEE", fg: "#DE122A" }, // critical
    MEDIUM: { label: "주의", bg: "#FFF8DB", fg: "#9E7E00" }, // caution
    LOW: { label: "경증", bg: "#EAF6F0", fg: "#228756" }, // safe
  } as const;
  const c = map[level];
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text variant="caption" style={{ color: c.fg, fontWeight: "700", fontSize: 10 }}>
        {c.label}
      </Text>
    </View>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.line,
        padding: 14,
        gap: 4,
      }}
    >
      <Text variant="h2" style={{ color: tone }}>
        {value}
      </Text>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  order: {
    position: "absolute",
    right: -4,
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
