import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";

type ToastKind = "success" | "error" | "info";
type ToastState = { message: string; kind: ToastKind } | null;

const ToastContext = createContext<{
  show: (message: string, kind?: ToastKind) => void;
} | null>(null);

/**
 * 가벼운 상태 알림. 성공/안내는 모달 Alert 대신 이걸 쓴다(흐름을 끊지 않음).
 * 파괴적 확인(삭제·탈퇴)은 여전히 Alert 로 사용자 확인을 받는다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, kind: ToastKind = "success") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, kind });
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? <ToastView message={toast.message} kind={toast.kind} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  // Provider 밖에서도 앱이 죽지 않도록 no-op 폴백
  return ctx ?? { show: () => {} };
}

function ToastView({ message, kind }: { message: string; kind: ToastKind }) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 180 }).start();
  }, [anim, message]);

  const tone = {
    success: { icon: "checkmark-circle" as const, color: palette.success },
    error: { icon: "alert-circle" as const, color: palette.danger },
    info: { icon: "information-circle" as const, color: colors.brand },
  }[kind];

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.wrap,
        {
          bottom: insets.bottom + 90,
          backgroundColor: colors.surface,
          borderColor: colors.line,
          borderRadius: radius.lg,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}
    >
      <Ionicons name={tone.icon} size={20} color={tone.color} />
      <Text variant="small" style={{ flex: 1, lineHeight: 20 }}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
