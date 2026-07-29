import { useCallback, useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Link, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { SkeletonList } from "@/components/Skeleton";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { statusLabel, type AppointmentStatus } from "@/lib/mock";
import { listMyAppointments } from "@/api/appointments";
import { listDoctors } from "@/api/doctors";
import { unreadCount } from "@/api/notifications";
import { useAsync } from "@/lib/useAsync";
import { useAuth } from "@/context/AuthContext";
import { DoctorHome } from "@/components/DoctorHome";

export default function Home() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  // 홈 데이터: 예약·의료진을 병렬로 가져와 '진행 중 진료', '다음 예약', '추천 의료진'을 파생.
  // 아픈 사용자에게는 추천보다 '지금 해야 할 행동'이 먼저다(상태 중심 홈).
  const fetchHome = useCallback(async () => {
    const [appts, docs] = await Promise.all([listMyAppointments(), listDoctors()]);
    const active = appts.find((a) => a.status === "WAITING" || a.status === "IN_PROGRESS") ?? null;
    const next = appts.find((a) => a.status === "SCHEDULED") ?? null;
    return { active, next, doctors: docs.slice(0, 2) };
  }, []);
  const { state, data, error, reload } = useAsync(fetchHome);

  // 읽지 않은 알림 개수(부가 정보). 실패해도 홈 전체를 막지 않는다. 화면 복귀 시 갱신.
  const [unread, setUnread] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      unreadCount().then((n) => alive && setUnread(n));
      return () => {
        alive = false;
      };
    }, [])
  );

  // 의료진은 진료 대기열 중심의 홈을 본다.
  if (user?.role === "DOCTOR") {
    return <DoctorHome />;
  }

  const active = data?.active ?? null;
  const next = data?.next ?? null;
  const recommended = data?.doctors ?? [];

  return (
    <Screen onRefresh={reload}>
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
          accessibilityRole="button"
          accessibilityLabel={
            unread > 0 ? `알림, 읽지 않음 ${unread > 99 ? "99+" : unread}건` : "알림"
          }
        >
          <Ionicons name="notifications-outline" size={24} color={colors.content} />
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text variant="caption" style={styles.badgeText}>
                {unread > 9 ? "9+" : unread}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* 홈 데이터: 로딩/오류/성공 분리. 아픈 사용자에게 '지금 할 일'을 먼저 보인다. */}
      {state === "loading" ? (
        <View style={{ marginTop: spacing.x6 }}>
          <SkeletonList count={2} />
        </View>
      ) : null}

      {state === "error" ? (
        <Card style={{ marginTop: spacing.x6, alignItems: "center", paddingVertical: 28, gap: 10 }}>
          <Ionicons name="cloud-offline-outline" size={28} color={colors.subtle} />
          <Text variant="body" color="muted" center>
            {error ?? "정보를 불러오지 못했어요."}
          </Text>
          <Button label="다시 시도" variant="secondary" onPress={reload} style={{ marginTop: 2 }} />
        </Card>
      ) : null}

      {/* 1) 진행 중/대기 — 지금 해야 할 행동을 최상단에 */}
      {state === "success" && active ? (
        <Pressable
          onPress={() =>
            router.push(active.status === "IN_PROGRESS" ? `/consult/${active.id}` : `/waiting/${active.id}`)
          }
          style={{ marginTop: spacing.x6 }}
          accessibilityRole="button"
          accessibilityLabel={`${active.status === "IN_PROGRESS" ? "진행 중인 진료" : "대기 중인 진료"}, ${active.doctorLabel}, 입장`}
        >
          <View style={[styles.hero, { backgroundColor: palette.primary[700], borderRadius: radius.xl }]}>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={styles.liveDot} />
                <Text variant="small" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {active.status === "IN_PROGRESS" ? "진료 진행 중" : "대기 중"}
                </Text>
              </View>
              <Text variant="h3" style={{ color: "#fff" }}>
                {active.doctorLabel}
              </Text>
              <Text variant="small" style={{ color: "rgba(255,255,255,0.8)" }}>
                {active.status === "IN_PROGRESS" ? "진료실로 입장하세요" : "곧 연결됩니다 · 입장 준비"}
              </Text>
            </View>
            <View style={styles.heroBtn}>
              <Ionicons name="arrow-forward" size={22} color={palette.primary[700]} />
            </View>
          </View>
        </Pressable>
      ) : null}

      {/* 2) 다음 예약과 준비할 일 */}
      {state === "success" && next ? (
        <View style={{ marginTop: spacing.x6, gap: spacing.x3 }}>
          <Text variant="h3">다음 예약</Text>
          <Card>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Avatar name={next.doctorLabel} />
                <View>
                  <Text variant="bodyStrong">{next.doctorLabel}</Text>
                  <Text variant="small" color="muted">
                    {next.when}
                  </Text>
                </View>
              </View>
              <Badge tone="brand" label={statusLabel[next.status as AppointmentStatus] ?? next.status} />
            </View>
            <Button
              label="진료 준비하기"
              full
              style={{ marginTop: spacing.x4 }}
              onPress={() => router.push(`/appointment/${next.id}`)}
            />
          </Card>
        </View>
      ) : null}

      {/* 3) 새 진료 시작 — 진행 중/다음 예약이 있으면 보조로 낮춰 배치 */}
      {active || next ? (
        <Pressable
          onPress={() => router.push("/doctors")}
          style={{ marginTop: spacing.x6 }}
          accessibilityRole="button"
          accessibilityLabel="새 진료 시작하기"
        >
          <Card>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="bodyStrong">새 진료 시작하기</Text>
                <Text variant="small" color="muted">
                  평균 3분 이내 연결 · 검증된 의료진
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={colors.brand} />
            </View>
          </Card>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.push("/doctors")}
          style={{ marginTop: spacing.x6 }}
          accessibilityRole="button"
          accessibilityLabel="지금 바로 진료 받기"
        >
          <View style={[styles.hero, { backgroundColor: palette.primary[700], borderRadius: radius.xl }]}>
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
      )}

      {/* 추천 의료진 */}
      {state === "success" && recommended.length ? (
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
          {recommended.map((d) => (
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
      ) : null}
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
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#3BD07A" },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: palette.accent[500],
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
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
