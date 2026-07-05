import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";

const points = [
  { icon: "id-card-outline", title: "본인확인으로 안전하게", desc: "휴대폰 인증 한 번이면 준비 끝." },
  { icon: "ribbon-outline", title: "검증된 의료진", desc: "면허 검증을 통과한 의료진만 진료합니다." },
  { icon: "lock-closed-outline", title: "기록은 암호화", desc: "진료·문진은 AES‑256으로 보호됩니다." },
] as const;

export default function Onboarding() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
      <View style={styles.brand}>
        <Ionicons name="shield-checkmark" size={24} color={colors.brand} />
        <Text variant="h3">
          Medi<Text variant="h3" color="brand">View</Text>
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: "center", gap: spacing.x2 }}>
        <Text variant="display">
          집에서 만나는{"\n"}
          <Text variant="display" color="brand">
            믿을 수 있는
          </Text>{" "}
          진료
        </Text>
        <Text variant="body" color="muted" style={{ marginTop: 4, marginBottom: spacing.x6 }}>
          안전을 처음부터 설계에 담았습니다.
        </Text>

        <View style={{ gap: spacing.x4 }}>
          {points.map((p) => (
            <View key={p.title} style={styles.point}>
              <View style={[styles.pointIcon, { backgroundColor: palette.primary[50] }]}>
                <Ionicons name={p.icon} size={22} color={colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{p.title}</Text>
                <Text variant="small" color="muted">
                  {p.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.x3 }}>
        <Button label="시작하기" full onPress={() => router.push("/(auth)/signup")} />
        <Button
          label="이미 계정이 있어요"
          variant="ghost"
          full
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  point: { flexDirection: "row", alignItems: "center", gap: 14 },
  pointIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
