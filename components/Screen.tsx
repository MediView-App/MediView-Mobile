import { ScrollView, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/theme";
import { Text } from "./Text";

type ScreenProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

/** 화면 공통 래퍼: SafeArea + canvas 배경 + 표준 여백(+옵션 헤더). */
export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  contentStyle,
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const header = title ? (
    <View style={{ gap: 4, marginBottom: spacing.x5 }}>
      <Text variant="h1">{title}</Text>
      {subtitle ? (
        <Text variant="body" color="muted">
          {subtitle}
        </Text>
      ) : null}
    </View>
  ) : null;

  const padding = {
    paddingTop: insets.top + spacing.x4,
    paddingBottom: insets.bottom + spacing.x16,
    paddingHorizontal: spacing.x5,
  };

  if (!scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.canvas }, padding, contentStyle]}>
        {header}
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.canvas }}
      contentContainerStyle={[padding, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {header}
      {children}
    </ScrollView>
  );
}
