import { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@/theme/tokens";
import { Text } from "./Text";

/** 브랜드 로딩(스플래시) 화면 — teal 캔버스 + 맥동하는 로고마크. */
export function Loading({ label }: { label?: string }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 720,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 720,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.mark, { transform: [{ scale }], opacity }]}>
        <Ionicons name="shield-checkmark" size={46} color="#fff" />
      </Animated.View>
      <Text variant="h2" style={{ color: "#fff", marginTop: 20 }}>
        MediView
      </Text>
      <Text variant="small" style={{ color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
        {label ?? "안전한 진료를 준비하고 있어요"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary[700],
  },
  mark: {
    width: 96,
    height: 96,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
});
