import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SkeletonList } from "@/components/Skeleton";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { type Notification, type NotiType } from "@/lib/mock";
import { listNotifications } from "@/api/notifications";

const iconByType: Record<NotiType, keyof typeof Ionicons.glyphMap> = {
  appointment: "calendar",
  payment: "card",
  document: "document-text",
  system: "shield-checkmark",
};

export default function Notifications() {
  const { colors, spacing } = useTheme();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  useEffect(() => {
    let alive = true;
    listNotifications()
      .then((list) => alive && setNotifications(list))
      .catch(() => alive && setNotifications([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Header title="알림" />
      <Screen>
        {notifications === null ? (
          <SkeletonList count={4} />
        ) : notifications.length ? (
          <View style={{ gap: spacing.x2 }}>
            {notifications.map((n) => (
              <Card
                key={n.id}
                style={{
                  flexDirection: "row",
                  gap: 12,
                  backgroundColor: n.read ? colors.surface : palette.primary[50],
                  borderColor: n.read ? colors.line : "transparent",
                }}
              >
                <View style={[styles.icon, { backgroundColor: colors.surface }]}>
                  <Ionicons name={iconByType[n.type]} size={20} color={colors.brand} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text variant="bodyStrong">{n.title}</Text>
                    <Text variant="caption" color="subtle">
                      {n.time}
                    </Text>
                  </View>
                  <Text variant="small" color="muted" style={{ lineHeight: 20 }}>
                    {n.body}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState icon="notifications-outline" title="새 알림이 없어요" />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
