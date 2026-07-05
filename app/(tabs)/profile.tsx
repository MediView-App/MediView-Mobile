import { View, Pressable, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/theme/theme";
import { useAuth } from "@/context/AuthContext";

type Row = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  href: Href;
};

const menu: Row[][] = [
  [
    { icon: "shield-checkmark-outline", label: "본인확인(KYC)", hint: "완료", href: "/(auth)/kyc" },
    { icon: "document-text-outline", label: "서류함", href: "/documents" },
    { icon: "notifications-outline", label: "알림", href: "/notifications" },
  ],
  [
    { icon: "settings-outline", label: "설정", href: "/settings" },
    { icon: "lock-closed-outline", label: "개인정보 · 보안", href: "/settings" },
    { icon: "help-circle-outline", label: "고객센터", href: "/support" },
  ],
];

export default function Profile() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();

  const doLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <Screen title="마이">
      {/* 프로필 카드 */}
      <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Avatar name={user?.name ?? "사용자"} size={56} />
        <View style={{ flex: 1 }}>
          <Text variant="h3">{user?.name ?? "사용자"}</Text>
          <Text variant="small" color="muted">
            {user?.email ?? ""}
          </Text>
        </View>
        <Badge tone="success" label="본인확인 완료" />
      </Card>

      {menu.map((group, gi) => (
        <View
          key={gi}
          style={{
            marginTop: spacing.x5,
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.line,
            overflow: "hidden",
          }}
        >
          {group.map((row, ri) => (
            <Pressable
              key={row.label}
              onPress={() => router.push(row.href)}
              style={({ pressed }) => [
                styles.row,
                {
                  borderTopWidth: ri === 0 ? 0 : 1,
                  borderTopColor: colors.line,
                  backgroundColor: pressed ? colors.surface2 : "transparent",
                },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Ionicons name={row.icon} size={20} color={colors.muted} />
                <Text variant="body">{row.label}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                {row.hint ? (
                  <Text variant="small" color="brandInk">
                    {row.hint}
                  </Text>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
              </View>
            </Pressable>
          ))}
        </View>
      ))}

      <Pressable
        onPress={doLogout}
        style={{ marginTop: spacing.x6, alignItems: "center", paddingVertical: 14 }}
      >
        <Text variant="body" color="muted">
          로그아웃
        </Text>
      </Pressable>
      <Text variant="caption" color="subtle" center style={{ marginTop: spacing.x2 }}>
        MediView v0.1.0
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
});
