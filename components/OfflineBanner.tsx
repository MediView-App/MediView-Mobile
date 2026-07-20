import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { palette } from "@/theme/tokens";

/**
 * 네트워크 끊김 배너. 끊기면 화면이 조용히 비는 대신 원인을 알려준다.
 * (진료·처방처럼 실패가 치명적인 흐름에서 특히 중요)
 */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      // isInternetReachable 은 확인 전 null 일 수 있어 false 일 때만 오프라인으로 본다.
      setOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    return () => unsub();
  }, []);

  if (!offline) return null;

  return (
    <View
      accessibilityLiveRegion="assertive"
      style={[styles.bar, { paddingTop: insets.top + 8 }]}
    >
      <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
      <Text variant="caption" style={{ color: "#fff", fontWeight: "700" }}>
        인터넷에 연결되어 있지 않아요. 일부 기능이 제한됩니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: palette.neutral[800],
  },
});
