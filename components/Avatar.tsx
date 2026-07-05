import { View } from "react-native";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { Text } from "./Text";

export function Avatar({
  name,
  size = 48,
  onBrand = false,
}: {
  name: string;
  size?: number;
  onBrand?: boolean;
}) {
  const { colors } = useTheme();
  const initial = name.trim().charAt(0) || "?";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: onBrand ? "rgba(255,255,255,0.16)" : palette.primary[50],
      }}
    >
      <Text
        variant="h3"
        style={{
          color: onBrand ? "#fff" : colors.brandInk,
          fontSize: size * 0.4,
        }}
      >
        {initial}
      </Text>
    </View>
  );
}
