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

type QueueItem = {
  id: string;
  patient: string;
  age: string;
  gender: string;
  reason: string;
  waitedMin: number;
  status: "WAITING" | "IN_PROGRESS";
};

// 데모용 진료 대기열. 실서버에서는 담당의의 오늘 예약/세션에서 조회한다.
const QUEUE: QueueItem[] = [
  { id: "1", patient: "김*수", age: "34세", gender: "남", reason: "인후통·기침 3일", waitedMin: 2, status: "WAITING" },
  { id: "2", patient: "이*은", age: "28세", gender: "여", reason: "두드러기·가려움", waitedMin: 6, status: "WAITING" },
  { id: "3", patient: "박*호", age: "51세", gender: "남", reason: "고혈압 약 재처방", waitedMin: 11, status: "WAITING" },
];

export function DoctorHome() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const waiting = QUEUE.filter((q) => q.status === "WAITING").length;

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

      <View style={{ gap: spacing.x3 }}>
        {QUEUE.map((q, i) => (
          <Card key={q.id} style={{ gap: spacing.x3 }}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                <View style={{ position: "relative" }}>
                  <Avatar name={q.patient} />
                  <View
                    style={[
                      styles.order,
                      { backgroundColor: colors.brand, borderColor: colors.surface },
                    ]}
                  >
                    <Text variant="caption" style={{ color: "#fff", fontWeight: "800" }}>
                      {i + 1}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">
                    {q.patient} · {q.gender}/{q.age}
                  </Text>
                  <Text variant="small" color="muted" numberOfLines={1}>
                    {q.reason}
                  </Text>
                </View>
              </View>
              <Text variant="caption" color="subtle">
                {q.waitedMin}분 대기
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button
                label="진료 시작"
                style={{ flex: 1 }}
                onPress={() => router.push(`/consult/${q.id}`)}
              />
              <Button
                label="문서 발급"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => router.push(`/prescribe/${q.id}`)}
              />
            </View>
          </Card>
        ))}
      </View>
    </Screen>
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
