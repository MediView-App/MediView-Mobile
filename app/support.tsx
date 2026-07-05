import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";

const channels = [
  { icon: "chatbubbles-outline", label: "채팅 상담", desc: "평일 09:00~18:00" },
  { icon: "call-outline", label: "전화 상담", desc: "1600-0000" },
  { icon: "mail-outline", label: "이메일 문의", desc: "help@mediview.app" },
] as const;

const faqs = [
  { q: "비대면 진료는 어떤 경우에 받나요?", a: "재진·경증 상담 등 비대면 진료가 허용되는 범위에서 이용할 수 있습니다." },
  { q: "처방전은 어떻게 받나요?", a: "진료 완료 후 서류함에서 처방전을 확인하고 원하는 약국으로 전송할 수 있어요." },
  { q: "결제 취소·환불은 어떻게 하나요?", a: "진료 전이라면 예약 화면에서 취소할 수 있고, 환불은 결제 수단으로 자동 처리됩니다." },
];

export default function Support() {
  const { colors, spacing, radius } = useTheme();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <Header title="고객센터" />
      <Screen>
        {/* 채널 */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {channels.map((c) => (
            <Card key={c.label} style={{ flex: 1, alignItems: "center", gap: 6, paddingVertical: 18 }}>
              <View style={[styles.icon, { backgroundColor: palette.primary[50] }]}>
                <Ionicons name={c.icon} size={22} color={colors.brand} />
              </View>
              <Text variant="caption" center style={{ fontWeight: "700" }}>
                {c.label}
              </Text>
            </Card>
          ))}
        </View>

        {/* FAQ */}
        <Text variant="h3" style={{ marginTop: spacing.x8, marginBottom: spacing.x3 }}>
          자주 묻는 질문
        </Text>
        <View style={{ gap: spacing.x2 }}>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Pressable
                key={f.q}
                onPress={() => setOpen(isOpen ? null : i)}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.line,
                  borderRadius: radius.md,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text variant="body" style={{ flex: 1, fontWeight: "600" }}>
                    {f.q}
                  </Text>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.subtle}
                  />
                </View>
                {isOpen ? (
                  <Text variant="small" color="muted" style={{ marginTop: 10, lineHeight: 21 }}>
                    {f.a}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
});
