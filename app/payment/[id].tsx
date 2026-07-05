import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { payForAppointment } from "@/api/payments";

const AMOUNT = 12000;

const methods = [
  { key: "card", label: "신용/체크카드", icon: "card-outline" },
  { key: "kakao", label: "카카오페이", icon: "chatbubble-outline" },
  { key: "toss", label: "토스페이", icon: "flash-outline" },
] as const;

export default function Payment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [method, setMethod] = useState<string>("card");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setError(null);
    setPaying(true);
    try {
      // prepare → PG 결제 → confirm(서버 검증). 데모 모드면 시뮬레이션.
      const res = await payForAppointment(Number(id) || 1, AMOUNT, method);
      if (res.status === "PAID") setDone(true);
      else setError("결제가 완료되지 않았습니다. 다시 시도해 주세요.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "결제에 실패했습니다.");
    } finally {
      setPaying(false);
    }
  };

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, paddingTop: insets.top }}>
        <Screen>
          <View style={{ alignItems: "center", paddingTop: spacing.x10 }}>
            <View style={[styles.check, { backgroundColor: palette.primary[50] }]}>
              <Ionicons name="checkmark-circle" size={64} color={colors.brand} />
            </View>
            <Text variant="h1" center style={{ marginTop: spacing.x5 }}>
              결제가 완료됐어요
            </Text>
            <Text variant="h2" color="brand" style={{ marginTop: 6 }}>
              12,000원
            </Text>
            <Text variant="small" color="muted" center style={{ marginTop: 8, maxWidth: 300 }}>
              처방전이 발급되었습니다. 서류함에서 확인하고 약국으로 전송할 수 있어요.
            </Text>
            <Button
              label="처방전 보기"
              full
              onPress={() => router.replace("/documents")}
              style={{ marginTop: spacing.x8 }}
            />
            <Button
              label="닫기"
              variant="ghost"
              full
              onPress={() => router.replace("/(tabs)/appointments")}
              style={{ marginTop: spacing.x2 }}
            />
          </View>
        </Screen>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas, paddingTop: insets.top }}>
      {/* 모달 헤더 */}
      <View style={styles.modalHead}>
        <Text variant="h3">결제</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={26} color={colors.muted} />
        </Pressable>
      </View>

      <Screen contentStyle={{ paddingBottom: 120, paddingTop: spacing.x2 }}>
        {/* 금액 */}
        <Card style={{ gap: spacing.x3 }}>
          <Row label="진료비" value="12,000원" />
          <Row label="할인" value="0원" />
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <Row label="총 결제금액" value="12,000원" strong />
        </Card>

        {/* 수단 */}
        <Text variant="h3" style={{ marginTop: spacing.x6, marginBottom: spacing.x3 }}>
          결제 수단
        </Text>
        <View style={{ gap: spacing.x2 }}>
          {methods.map((m) => {
            const active = method === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMethod(m.key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.brand : colors.line,
                  borderRadius: radius.md,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                }}
              >
                <Ionicons name={m.icon} size={22} color={active ? colors.brand : colors.muted} />
                <Text variant="body" style={{ flex: 1 }}>
                  {m.label}
                </Text>
                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={active ? colors.brand : colors.subtle}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", gap: 6, alignItems: "center", marginTop: spacing.x4 }}>
          <Ionicons name="shield-checkmark" size={15} color={colors.brand} />
          <Text variant="caption" color="muted">
            결제는 PG사 서버 검증을 거쳐 안전하게 처리됩니다.
          </Text>
        </View>
      </Screen>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.line,
        }}
      >
        {error ? (
          <Text variant="small" center style={{ color: colors.accent, marginBottom: 10 }}>
            {error}
          </Text>
        ) : null}
        <Button label={paying ? "결제 중…" : "12,000원 결제하기"} full onPress={pay} />
      </View>
    </View>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text variant="small" color="muted">
        {label}
      </Text>
      <Text variant={strong ? "h3" : "body"} color={strong ? "content" : "content"}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  check: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
});
