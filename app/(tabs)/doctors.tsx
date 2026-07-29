import { useCallback, useMemo, useState } from "react";
import { View, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { SkeletonList } from "@/components/Skeleton";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { listDoctors } from "@/api/doctors";
import { useAsync, formatSyncedAt } from "@/lib/useAsync";

const specialties = ["전체", "내과", "피부과", "정신건강의학과", "소아청소년과"];

type SortKey = "recommended" | "rating" | "soonest";
const sorts: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "추천순" },
  { key: "rating", label: "평점순" },
  { key: "soonest", label: "빠른 진료순" },
];

/** "오늘 14:30" / "내일 10:00" → 정렬용 분 단위 값. 파싱 실패 시 뒤로 보낸다. */
function slotRank(nextSlot: string): number {
  const m = nextSlot?.match(/(\d{1,2}):(\d{2})/);
  const minutes = m ? Number(m[1]) * 60 + Number(m[2]) : 12 * 60;
  if (!nextSlot) return Number.MAX_SAFE_INTEGER;
  if (nextSlot.includes("오늘")) return minutes;
  if (nextSlot.includes("내일")) return 24 * 60 + minutes;
  return 48 * 60 + minutes;
}

export default function Doctors() {
  const { colors, radius, spacing } = useTheme();
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("전체");
  const [sort, setSort] = useState<SortKey>("recommended");
  const fetcher = useCallback(() => listDoctors(), []);
  const { state, data, error, lastSyncedAt, reload } = useAsync(fetcher);

  const filtered = useMemo(() => {
    const list = (data ?? []).filter(
      (d) =>
        (spec === "전체" || d.specialty === spec) &&
        (q === "" || d.name.includes(q) || d.org.includes(q)),
    );

    const sorted = [...list];
    if (sort === "rating") {
      sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    } else if (sort === "soonest") {
      sorted.sort((a, b) => slotRank(a.nextSlot) - slotRank(b.nextSlot));
    } else {
      // 추천순: 검증된 의료진 우선 → 평점 → 리뷰 수
      sorted.sort(
        (a, b) =>
          Number(b.verified) - Number(a.verified) ||
          b.rating - a.rating ||
          b.reviews - a.reviews,
      );
    }
    return sorted;
  }, [data, q, spec, sort]);

  return (
    <Screen title="의료진 찾기" subtitle="면허 검증을 통과한 의료진만 만납니다">
      {/* 검색 */}
      <View
        style={[
          styles.search,
          { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.subtle} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="이름 · 병원 검색"
          placeholderTextColor={colors.subtle}
          style={{ flex: 1, color: colors.content, fontSize: 15, paddingVertical: 10 }}
        />
      </View>

      {/* 진료과 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: spacing.x4 }}
      >
        {specialties.map((s) => {
          const active = s === spec;
          return (
            <Pressable
              key={s}
              onPress={() => setSpec(s)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: radius.full,
                backgroundColor: active ? colors.brand : colors.surface,
                borderWidth: 1,
                borderColor: active ? colors.brand : colors.line,
              }}
            >
              <Text
                variant="small"
                style={{ color: active ? colors.onBrand : colors.muted, fontWeight: "600" }}
              >
                {s}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 정렬 + 결과 수 */}
      {state === "success" ? (
        <View style={[styles.rowBetween, { marginBottom: spacing.x3 }]}>
          <Text variant="small" color="muted">
            {filtered.length}명
          </Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {sorts.map((s) => {
              const on = sort === s.key;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setSort(s.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: radius.full,
                    backgroundColor: on ? colors.surface2 : "transparent",
                  }}
                >
                  <Text
                    variant="caption"
                    style={{ color: on ? colors.content : colors.subtle, fontWeight: on ? "700" : "500" }}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* 목록 — loading/error/empty/success 분리. 검색·필터 UI 는 유지해 맥락 안에서 재시도. */}
      {state === "loading" ? <SkeletonList count={4} /> : null}
      {state === "error" ? (
        <Card style={{ alignItems: "center", paddingVertical: 32, gap: 10 }}>
          <Ionicons name="cloud-offline-outline" size={30} color={colors.subtle} />
          <Text variant="body" color="muted" center>
            {error ?? "의료진 목록을 불러오지 못했어요."}
          </Text>
          {formatSyncedAt(lastSyncedAt) ? (
            <Text variant="caption" color="subtle">
              {formatSyncedAt(lastSyncedAt)}
            </Text>
          ) : null}
          <Button label="다시 시도" variant="secondary" onPress={reload} style={{ marginTop: 4 }} />
        </Card>
      ) : null}
      <View style={{ gap: spacing.x3 }}>
        {filtered.map((d) => (
          <Link key={d.id} href={`/doctor/${d.id}`} asChild>
            <Pressable>
              <Card>
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                    <Avatar name={d.name} size={52} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <Text variant="bodyStrong">{d.name}</Text>
                        {d.verified ? (
                          <Ionicons name="shield-checkmark" size={14} color={colors.brand} />
                        ) : null}
                      </View>
                      <Text variant="small" color="muted">
                        {d.specialty} · {d.org}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <Ionicons name="star" size={13} color={palette.warning} />
                        <Text variant="caption" color="content">
                          {d.rating.toFixed(1)}
                        </Text>
                        <Text variant="caption" color="subtle">
                          ({d.reviews})
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <Text variant="caption" color="brandInk">
                      {d.nextSlot}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
                  </View>
                </View>
              </Card>
            </Pressable>
          </Link>
        ))}
        {state === "success" && filtered.length === 0 ? (
          <Text variant="body" color="muted" center style={{ paddingVertical: 40 }}>
            조건에 맞는 의료진이 없어요.
          </Text>
        ) : null}
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
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
});
