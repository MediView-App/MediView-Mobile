import { View } from "react-native";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { Text } from "./Text";

export type Tone = "brand" | "success" | "warning" | "danger" | "neutral";

const toneMap: Record<Tone, { bg: string; fg: string }> = {
  brand: { bg: palette.primary[50], fg: palette.primary[700] },
  success: { bg: "#E4F6ED", fg: "#137A4E" },
  warning: { bg: "#FBEFD9", fg: "#996314" },
  danger: { bg: "#FBE3E4", fg: "#B02529" },
  neutral: { bg: palette.neutral[100], fg: palette.neutral[600] },
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
