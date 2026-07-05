import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { Text } from "./Text";
import { Button } from "./Button";

/** 공통 에러 화면 — ErrorBoundary / 예외 상황에서 재사용. */
export function ErrorScreen({
  title = "문제가 발생했어요",
  message = "잠시 후 다시 시도해 주세요. 계속되면 고객센터로 문의해 주세요.",
  retryLabel = "다시 시도",
  onRetry,
}: {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.canvas, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: palette.primary[50] }]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.brand} />
      </View>
      <Text variant="h2" center style={{ marginTop: 20 }}>
        {title}
      </Text>
      <Text variant="body" color="muted" center style={{ marginTop: 8, maxWidth: 300 }}>
        {message}
      </Text>
      {onRetry ? (
        <Button label={retryLabel} onPress={onRetry} style={{ marginTop: 28 }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
