import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/theme";
import { Text } from "./Text";

export function EmptyState({
  icon = "file-tray-outline",
  title,
  message,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: 48, gap: 8 }}>
      <Ionicons name={icon} size={34} color={colors.subtle} />
      <Text variant="bodyStrong" color="muted">
        {title}
      </Text>
      {message ? (
        <Text variant="small" color="subtle" center style={{ maxWidth: 260 }}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}
