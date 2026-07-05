import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useTheme } from "@/theme/theme";
import { Loading } from "@/components/Loading";
import { ErrorScreen } from "@/components/ErrorScreen";
import { AuthProvider, useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Expo Router 전역 에러 바운더리 — 공통 에러 화면으로 폴백. */
export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => Promise<void>;
}) {
  return (
    <SafeAreaProvider>
      <ErrorScreen
        message={__DEV__ ? error.message : "잠시 후 다시 시도해 주세요."}
        onRetry={() => retry()}
      />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { status } = useAuth();
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  // 미인증 사용자가 보호 화면에 접근하면 온보딩으로. (완료 후 tabs 이동은 각 화면이 명시적으로 처리)
  useEffect(() => {
    if (status === "loading") return;
    SplashScreen.hideAsync().catch(() => {});

    const root = segments[0];
    const inAuthFlow = root === "(auth)" || root === "onboarding";

    if (status === "unauthenticated" && !inAuthFlow) {
      router.replace("/onboarding");
    }
  }, [status, segments, router]);

  if (status === "loading") {
    return (
      <>
        <StatusBar style="light" />
        <Loading />
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
        <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
        <Stack.Screen name="doctor/[id]" />
        <Stack.Screen name="booking/[id]" />
        <Stack.Screen name="intake/[id]" />
        <Stack.Screen name="consult/[id]" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="summary/[id]" />
        <Stack.Screen name="payment/[id]" options={{ presentation: "modal" }} />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="documents/index" />
        <Stack.Screen name="documents/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="support" />
      </Stack>
    </>
  );
}
