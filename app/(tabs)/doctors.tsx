import { useEffect, useMemo, useState } from "react";
import { View, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { SkeletonList } from "@/components/Skeleton";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { type Doctor } from "@/lib/mock";
import { listDoctors } from "@/api/doctors";

const specialties = ["전체", "내과", "피부과", "정신건강의학과", "소아청소년과"];

export default function Doctors() {
  const { colors, radius, spacing } = useTheme();
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("전체");
  const [items, setItems] = useState<Doctor[] | null>(null);

  useEffect(() => {
    let alive = true;
    listDoctors()
      .then((list) => alive && setItems(list))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      (items ?? []).filter(
        (d) =>
          (spec === "전체" || d.specialty === spec) &&
          (q === "" || d.name.includes(q) || d.org.includes(q))
      ),
    [items, q, spec]
  );

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

      {/* 목록 */}
      {items === null ? <SkeletonList count={4} /> : null}
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
        {items !== null && filtered.length === 0 ? (
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
