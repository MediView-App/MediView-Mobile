import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, useWindowDimensions } from "react-native";
import { useTheme } from "@/theme/theme";

export default function TabsLayout() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  // 태블릿(넓은 화면)에서는 하단 탭 대신 좌측 navigation rail 로 전환한다.
  const isTablet = width >= 768;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.subtle,
        tabBarPosition: isTablet ? "left" : "bottom",
        tabBarStyle: isTablet
          ? {
              backgroundColor: colors.surface,
              borderRightColor: colors.line,
              borderRightWidth: 1,
              width: 104,
              paddingTop: 16,
            }
          : {
              backgroundColor: colors.surface,
              borderTopColor: colors.line,
              height: Platform.OS === "ios" ? 88 : 64,
              paddingTop: 6,
            },
        // 글꼴 배율이 커도 레일/탭이 깨지지 않도록 라벨 확대 상한을 둔다.
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarLabelPosition: "below-icon",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: "의료진",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "예약",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "마이",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
