import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { DEMO_MODE } from "@/lib/config";
import { palette } from "@/theme/tokens";
import { Text } from "./Text";

/**
 * 데모 데이터로 동작 중임을 화면 상단에 명확히 알린다.
 * DEMO_MODE 는 개발 빌드에서만 켜지므로(config.ts), 이 배너는 프로덕션에 노출되지 않는다.
 */
export function DemoBanner() {
  const insets = useSafeAreaInsets();
  if (!DEMO_MODE) return null;
  return (
    <View
      style={[styles.bar, { paddingTop: insets.top + 6 }]}
      accessibilityRole="alert"
      accessibilityLabel="데모 데이터로 동작 중입니다. 실제 진료 정보가 아닙니다."
    >
      <Ionicons name="flask-outline" size={14} color={palette.warning} />
      <Text variant="caption" style={{ color: palette.warning, fontWeight: "700" }}>
        데모 데이터 · 실제 진료 정보가 아닙니다
      </Text>
    </View>
  );
}

// caution(#C79F00) 틴트. mobile palette 에는 caution 램프가 없어 warning 값의 투명도로 구성한다.
const CAUTION_TINT = "rgba(199,159,0,0.12)";
const CAUTION_LINE = "rgba(199,159,0,0.35)";

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 6,
    backgroundColor: CAUTION_TINT,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CAUTION_LINE,
  },
});
