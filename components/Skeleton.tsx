import { useEffect, useRef } from "react";
import { Animated, Easing, View, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/theme";

/**
 * 로딩 자리표시자. 스피너 대신 최종 레이아웃과 같은 모양으로 깜빡여 체감 대기를 줄인다.
 * (JellySafe patterns: 콘텐츠 영역은 Skeleton, 스피너는 지양)
 */
export function Skeleton({
  width = "100%",
  height = 16,
  radius: r,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const { colors, radius } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 950,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 950,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="불러오는 중"
      style={[
        {
          width,
          height,
          borderRadius: r ?? radius.sm,
          backgroundColor: colors.surface2,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
        },
        style,
      ]}
    />
  );
}

/** 카드형 목록 자리표시자 — 아바타 + 2줄 텍스트. */
export function SkeletonCard() {
  const { colors, spacing, radius } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.line,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Skeleton width={44} height={44} radius={22} />
      <View style={{ flex: 1, gap: spacing.x2 }}>
        <Skeleton width="55%" height={14} />
        <Skeleton width="35%" height={12} />
      </View>
    </View>
  );
}

/** 카드 목록 n개 */
export function SkeletonList({ count = 3 }: { count?: number }) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.x3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}
