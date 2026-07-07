import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/theme";
import { Text } from "./Text";

/** 스택 화면용 상단 헤더 — 뒤로가기 + 타이틀(+옵션 우측 액션). */
export function Header({
  title,
  right,
  onBack,
}: {
  title?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + 6,
          backgroundColor: colors.canvas,
          borderBottomColor: colors.line,
        },
      ]}
    >
      <Pressable
        onPress={onBack ?? (() => router.back())}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        style={[styles.icon, { backgroundColor: colors.surface, borderColor: colors.line }]}
      >
        <Ionicons name="chevron-back" size={22} color={colors.content} />
      </Pressable>
      <Text variant="h3" numberOfLines={1} style={{ flex: 1 }} accessibilityRole="header">
        {title}
      </Text>
      <View style={{ minWidth: 40, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
