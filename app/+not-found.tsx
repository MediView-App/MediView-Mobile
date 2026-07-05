import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";

export default function NotFound() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "페이지를 찾을 수 없어요" }} />
      <View
        style={{
          flex: 1,
          backgroundColor: colors.canvas,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: palette.primary[50],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="compass-outline" size={40} color={colors.brand} />
        </View>
        <Text variant="display" center style={{ marginTop: 20 }}>
          404
        </Text>
        <Text variant="body" color="muted" center style={{ marginTop: 6, maxWidth: 300 }}>
          찾으시는 페이지가 없어요. 주소가 바뀌었거나 삭제되었을 수 있어요.
        </Text>
        <Button
          label="홈으로 돌아가기"
          onPress={() => router.replace("/")}
          style={{ marginTop: 28 }}
        />
      </View>
    </>
  );
}
