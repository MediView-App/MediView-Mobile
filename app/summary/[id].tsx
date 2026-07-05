import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { FooterCTA } from "../booking/[id]";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";

const meds = [
  { name: "타이레놀정 500mg", dose: "1일 3회 · 식후 30분", days: "3일분" },
  { name: "코대원포르테시럽", dose: "1일 3회 · 식후", days: "3일분" },
];
const cares = ["충분한 수분 섭취와 휴식", "증상 악화 시 재진료", "타인과 접촉 자제"];

export default function Summary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spacing, colors } = useTheme();
  const router = useRouter();

  return (
    <>
      <Header title="진료 요약" />
      <Screen contentStyle={{ paddingBottom: 120 }}>
        <View style={styles.aiTag}>
          <Ionicons name="sparkles" size={14} color={colors.brand} />
          <Text variant="caption" color="brandInk">
            AI 요약 · 의료진 검토 완료
          </Text>
        </View>

        <Text variant="h1" style={{ marginTop: spacing.x3 }}>
          급성 상기도 감염
        </Text>
        <Text variant="small" color="muted" style={{ marginTop: 4 }}>
          김서연 내과 전문의 · 오늘 14:30
        </Text>

        {/* 요약 */}
        <Card style={{ marginTop: spacing.x5, gap: 6 }}>
          <Text variant="bodyStrong">진료 내용</Text>
          <Text variant="body" color="muted" style={{ lineHeight: 24 }}>
            기침·콧물·미열로 내원. 청진상 특이소견 없음. 대증 치료 처방하며 3일 후
            증상 지속 시 재진료 권고.
          </Text>
        </Card>

        {/* 처방 */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.x6, marginBottom: spacing.x3 }}>
          <Text variant="h3">처방전</Text>
          <Badge tone="warning" label="발급 대기" />
        </View>
        <View style={{ gap: spacing.x2 }}>
          {meds.map((m) => (
            <Card key={m.name} style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyStrong">{m.name}</Text>
                <Text variant="small" color="brandInk">
                  {m.days}
                </Text>
              </View>
              <Text variant="small" color="muted">
                {m.dose}
              </Text>
            </Card>
          ))}
        </View>

        {/* 주의사항 */}
        <Text variant="h3" style={{ marginTop: spacing.x6, marginBottom: spacing.x3 }}>
          주의사항
        </Text>
        <Card style={{ gap: 10 }}>
          {cares.map((c) => (
            <View key={c} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
              <Ionicons name="checkmark-circle" size={18} color={colors.brand} />
              <Text variant="small" color="muted" style={{ flex: 1, lineHeight: 20 }}>
                {c}
              </Text>
            </View>
          ))}
        </Card>

        <View style={[styles.disclaimer, { borderColor: colors.line }]}>
          <Text variant="caption" color="subtle" style={{ lineHeight: 18 }}>
            본 요약은 AI가 생성한 초안을 의료진이 검토·승인한 것입니다. 처방전은
            결제 완료 후 발급됩니다.
          </Text>
        </View>
      </Screen>

      <FooterCTA label="12,000원 결제하기" onPress={() => router.push(`/payment/${id}`)} />
    </>
  );
}

const styles = StyleSheet.create({
  aiTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: palette.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  disclaimer: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});
