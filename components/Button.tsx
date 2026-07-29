import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/theme";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  full?: boolean;
  disabled?: boolean;
  /** 처리 중 상태. 스피너 표시 + 중복 누름 방지 + 스크린리더에 busy 전달. */
  loading?: boolean;
  style?: ViewStyle;
};

/** 손끝 배려: 최소 높이 52pt(≥44) pill 버튼. */
export function Button({
  label,
  onPress,
  variant = "primary",
  full,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const { colors, radius } = useTheme();
  const inactive = disabled || loading;

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
      onPress={inactive ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg[variant],
          borderRadius: radius.full,
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: colors.lineStrong,
          alignSelf: full ? "stretch" : "flex-start",
          opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed && !inactive ? 0.99 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator size="small" color={colors[fg[variant]]} />
        ) : null}
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
