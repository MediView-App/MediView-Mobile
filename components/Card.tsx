import { View, type ViewProps } from "react-native";
import { useTheme } from "@/theme/theme";

/** 라운드 lg + 소프트 elevation 카드. */
export function Card({ style, ...rest }: ViewProps) {
  const { colors, radius, spacing, elevation } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.line,
          padding: spacing.x5,
        },
        elevation.e1,
        style,
      ]}
      {...rest}
    />
  );
}
