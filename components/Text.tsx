import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { useTheme } from "@/theme/theme";
import type { TypographyVariant, ThemeColors } from "@/theme/tokens";

type ColorRole = keyof ThemeColors;

type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: ColorRole;
  center?: boolean;
};

/** 타이포 스케일과 역할 색을 강제하는 텍스트 컴포넌트. */
export function Text({
  variant = "body",
  color = "content",
  center,
  style,
  maxFontSizeMultiplier = 2,
  ...rest
}: TextProps) {
  const theme = useTheme();
  return (
    <RNText
      // 접근성: OS 큰 글씨 설정을 따르되(기본 allowFontScaling), 레이아웃 붕괴를 막기 위해 2배로 상한.
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        theme.typography[variant],
        { color: theme.colors[color] },
        center && { textAlign: "center" },
        style,
      ]}
      {...rest}
    />
  );
}
