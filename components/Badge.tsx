import { View } from "react-native";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { Text } from "./Text";

export type Tone = "brand" | "success" | "warning" | "danger" | "neutral";

// JellySafe 리스크 스케일 레시피: 배경은 상태색 -5 틴트, 텍스트는 상태색 -50.
const toneMap: Record<Tone, { bg: string; fg: string }> = {
  brand: { bg: palette.primary[50], fg: palette.primary[600] }, // primary-5 / primary-60
  success: { bg: "#EAF6F0", fg: "#228756" }, // safe-5 / safe-50
  warning: { bg: "#FFF8DB", fg: "#9E7E00" }, // caution-5 / caution-50
  danger: { bg: "#FDECEE", fg: "#DE122A" }, // critical-5 / critical-50
  neutral: { bg: palette.neutral[100], fg: palette.neutral[700] }, // gray-10 / gray-70
};

export function Badge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  const { radius } = useTheme();
  const c = toneMap[tone];
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: c.bg,
        borderRadius: radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text variant="caption" style={{ color: c.fg }}>
        {label}
      </Text>
    </View>
  );
}
