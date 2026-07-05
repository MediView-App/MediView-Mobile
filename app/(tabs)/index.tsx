import { View, Pressable, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { doctors, appointments, statusLabel } from "@/lib/mock";

export default function Home() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const next = appointments.find((a) => a.status === "SCHEDULED");

  return (
    <Screen>
      {/* 인사 */}
      <View style={styles.rowBetween}>
        <View>
          <Text variant="small" color="muted">
            안녕하세요 👋
          </Text>
          <Text variant="h2">오늘도 건강하세요</Text>
        </View>
        <Pressable
          onPress={() => router.push("/notifications")}
          hitSlop={8}
          style={styles.bell}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.content} />
          <View style={styles.dot} />
        </Pressable>
      </View>

      {/* 지금 진료받기 CTA */}
      <Pressable onPress={() => router.push("/doctors")} style={{ marginTop: spacing.x6 }}>
        <View
          style={[
            styles.hero,
            { backgroundColor: palette.primary[700], borderRadius: radius.xl },
          ]}
        >
          <View style={{ flex: 1, gap: 6 }}>
            <Text variant="h3" style={{ color: "#fff" }}>
              지금 바로 진료 받기
            </Text>
            <Text variant="small" style={{ color: "rgba(255,255,255,0.8)" }}>
              평균 3분 이내 연결 · 검증된 의료진
            </Text>
          </View>
          <View style={styles.heroBtn}>
            <Ionicons name="arrow-forward" size={22} color={palette.primary[700]} />
          </View>
        </View>
      </Pressable>

      {/* 다가오는 예약 */}
      {next ? (
        <View style={{ marginTop: spacing.x6, gap: spacing.x3 }}>
          <Text variant="h3">다가오는 예약</Text>
          <Card>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Avatar name={next.doctor} />
                <View>
                  <Text variant="bodyStrong">{next.doctor} 의료진</Text>
                  <Text variant="small" color="muted">
                    {next.specialty} · {next.when}
                  </Text>
                </View>
              </View>
              <Badge tone="brand" label={statusLabel[next.status]} />
            </View>
            <Button
              label="진료실 입장"
              full
              style={{ marginTop: spacing.x4 }}
              onPress={() => router.push("/consult/1")}
            />
          </Card>
        </View>
      ) : null}

      {/* 추천 의료진 */}
      <View style={{ marginTop: spacing.x8, gap: spacing.x3 }}>
        <View style={styles.rowBetween}>
          <Text variant="h3">추천 의료진</Text>
          <Link href="/doctors" asChild>
            <Pressable>
              <Text variant="small" color="brandInk">
                전체 보기
              </Text>
            </Pressable>
          </Link>
        </View>

        <View style={{ gap: spacing.x3 }}>
          {doctors.slice(0, 2).map((d) => (
            <Link key={d.id} href={`/doctor/${d.id}`} asChild>
              <Pressable>
                <Card>
                  <View style={styles.rowBetween}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <Avatar name={d.name} />
                      <View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                          <Text variant="bodyStrong">{d.name}</Text>
                          {d.verified ? (
                            <Ionicons
                              name="shield-checkmark"
                              size={14}
                              color={colors.brand}
                            />
                          ) : null}
                        </View>
                        <Text variant="small" color="muted">
                          {d.specialty} · {d.org}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Ionicons name="star" size={13} color={palette.warning} />
                        <Text variant="small" color="content">
                          {d.rating.toFixed(1)}
                        </Text>
                      </View>
                      <Text variant="caption" color="brandInk">
                        {d.nextSlot}
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bell: { padding: 4 },
  dot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.accent[500],
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  heroBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
