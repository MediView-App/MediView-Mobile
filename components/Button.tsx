import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/theme";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  full?: boolean;
  style?: ViewStyle;
};

/** 손끝 배려: 최소 높이 52pt(≥44) pill 버튼. */
export function Button({
  label,
  onPress,
  variant = "primary",
  full,
  style,
}: ButtonProps) {
  const { colors, radius } = useTheme();

  const bg: Record<Variant, string> = {
    primary: colors.brand,
    secondary: colors.surface,
    ghost: "transparent",
  };
  const fg: Record<Variant, keyof typeof colors> = {
    primary: "onBrand",
    secondary: "content",
    ghost: "brandInk",
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg[variant],
          borderRadius: radius.full,
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: colors.lineStrong,
          alignSelf: full ? "stretch" : "flex-start",
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.inner}>
        <Text variant="bodyStrong" color={fg[variant]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
