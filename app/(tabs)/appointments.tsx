import { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { SkeletonList } from "@/components/Skeleton";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Badge, type Tone } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { statusLabel, type AppointmentStatus } from "@/lib/mock";
import { listMyAppointments, type AppointmentView } from "@/api/appointments";

const toneByStatus: Record<string, Tone> = {
  SCHEDULED: "brand",
  WAITING: "warning",
  IN_PROGRESS: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  NO_SHOW: "danger",
};

export default function Appointments() {
  const { spacing, colors } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<AppointmentView[] | null>(null);

  useEffect(() => {
    let alive = true;
    listMyAppointments()
      .then((list) => alive && setItems(list))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  if (items === null) {
    return (
      <Screen title="예약">
        <Text variant="h3" style={{ marginBottom: spacing.x3 }}>
          예정된 진료
        </Text>
        <SkeletonList count={2} />
      </Screen>
    );
  }

  const upcoming = items.filter((a) => a.status !== "COMPLETED");
  const past = items.filter((a) => a.status === "COMPLETED");

  return (
    <Screen title="예약">
      <Text variant="h3" style={{ marginBottom: spacing.x3 }}>
        예정된 진료
      </Text>
      {upcoming.length ? (
        <View style={{ gap: spacing.x3 }}>
          {upcoming.map((a) => (
            <Pressable key={a.id} onPress={() => router.push(`/appointment/${a.id}`)}>
            <Card>
              <View style={styles.rowBetween}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Avatar name={a.doctorLabel} />
                  <View>
                    <Text variant="bodyStrong">{a.doctorLabel}</Text>
                    <Text variant="small" color="muted">
                      {a.when}
                    </Text>
                  </View>
                </View>
                <Badge
                  tone={toneByStatus[a.status] ?? "neutral"}
                  label={statusLabel[a.status as AppointmentStatus] ?? a.status}
                />
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: spacing.x4 }}>
                <Button
                  label="진료실 입장"
                  style={{ flex: 1 }}
                  onPress={() => router.push(`/waiting/${a.id}`)}
                />
                <Button label="변경" variant="secondary" style={{ flex: 1 }} />
              </View>
            </Card>
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyCard />
      )}

      <Text variant="h3" style={{ marginTop: spacing.x8, marginBottom: spacing.x3 }}>
        지난 진료
      </Text>
      <View style={{ gap: spacing.x3 }}>
        {past.map((a) => (
          <Pressable key={a.id} onPress={() => router.push(`/appointment/${a.id}`)}>
          <Card>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Avatar name={a.doctorLabel} />
                <View>
                  <Text variant="bodyStrong">{a.doctorLabel}</Text>
                  <Text variant="small" color="muted">
                    {a.when}
                  </Text>
                </View>
              </View>
              <Ionicons name="document-text-outline" size={22} color={colors.subtle} />
            </View>
          </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function EmptyCard() {
  const { colors } = useTheme();
  return (
    <Card style={{ alignItems: "center", paddingVertical: 32, gap: 8 }}>
      <Ionicons name="calendar-outline" size={32} color={colors.subtle} />
      <Text variant="body" color="muted">
        예정된 진료가 없어요.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
