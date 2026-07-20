import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Badge, type Tone } from "@/components/Badge";
import { SkeletonList } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/theme/theme";
import { statusLabel, type AppointmentStatus } from "@/lib/mock";
import { listMyAppointments, type AppointmentView } from "@/api/appointments";

const toneByStatus: Record<string, Tone> = {
  SCHEDULED: "brand",
  WAITING: "warning",
  IN_PROGRESS: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  NO_SHOW: "danger",
};

/** "6월 28일" 같은 표기에서 월을 뽑아 그룹 키로 쓴다. 파싱 실패 시 원문 유지. */
function groupKey(when: string): string {
  const m = when.match(/(\d+)월/);
  if (m) return `${m[1]}월`;
  if (when.includes("오늘") || when.includes("대기")) return "이번 달";
  return when;
}

export default function History() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<AppointmentView[] | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await listMyAppointments());
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 시간축으로 묶어 보여준다(만성질환·반복 진료 흐름을 한눈에).
  const groups = useMemo(() => {
    if (!items) return [];
    const map = new Map<string, AppointmentView[]>();
    for (const a of items) {
      const k = groupKey(a.when);
      map.set(k, [...(map.get(k) ?? []), a]);
    }
    return [...map.entries()];
  }, [items]);

  if (items === null) {
    return (
      <>
        <Header title="진료 이력" />
        <Screen>
          <SkeletonList count={4} />
        </Screen>
      </>
    );
  }

  return (
    <>
      <Header title="진료 이력" />
      <Screen onRefresh={load}>
        {items.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="진료 이력이 없어요"
            message="첫 진료를 받으면 여기에 기록이 쌓입니다."
          />
        ) : (
          <>
            <Card style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: spacing.x5 }}>
              <View style={{ flex: 1 }}>
                <Text variant="h2">{items.length}회</Text>
                <Text variant="small" color="muted">
                  총 진료 횟수
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="h2">
                  {items.filter((a) => a.status === "COMPLETED").length}회
                </Text>
                <Text variant="small" color="muted">
                  완료된 진료
                </Text>
              </View>
            </Card>

            {groups.map(([label, list]) => (
              <View key={label} style={{ marginBottom: spacing.x6 }}>
                <Text variant="overline" color="subtle" style={{ marginBottom: spacing.x3 }}>
                  {label}
                </Text>
                <View>
                  {list.map((a, i) => (
                    <Pressable key={a.id} onPress={() => router.push(`/appointment/${a.id}`)}>
                      <View style={{ flexDirection: "row", gap: 12 }}>
                        {/* 타임라인 축 */}
                        <View style={{ alignItems: "center", width: 20 }}>
                          <View style={[styles.dot, { backgroundColor: colors.brand }]} />
                          {i < list.length - 1 ? (
                            <View style={[styles.line, { backgroundColor: colors.line }]} />
                          ) : null}
                        </View>
                        <Card style={{ flex: 1, marginBottom: spacing.x3, gap: 6 }}>
                          <View style={styles.rowBetween}>
                            <Text variant="bodyStrong">{a.doctorLabel}</Text>
                            <Badge
                              tone={toneByStatus[a.status] ?? "neutral"}
                              label={statusLabel[a.status as AppointmentStatus] ?? a.status}
                            />
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Ionicons name="calendar-outline" size={14} color={colors.subtle} />
                            <Text variant="small" color="muted">
                              {a.when}
                            </Text>
                          </View>
                        </Card>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 18 },
  line: { width: 2, flex: 1, marginTop: 4 },
});
