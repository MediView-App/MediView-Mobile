import { useEffect, useState } from "react";
import { View, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { type Doctor } from "@/lib/mock";
import { getDoctor } from "@/api/doctors";
import { getDoctorReviews, type DoctorReviewSummary } from "@/api/reviews";

const slots = ["오늘 14:30", "오늘 15:15", "오늘 16:00", "내일 10:00", "내일 11:30"];

export default function DoctorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null | undefined>(undefined);
  const [reviews, setReviews] = useState<DoctorReviewSummary | null>(null);

  useEffect(() => {
    let alive = true;
    getDoctor(String(id))
      .then((d) => {
        if (!alive) return;
        setDoctor(d);
        if (d) {
          getDoctorReviews(d.userId ?? d.id)
            .then((r) => alive && setReviews(r))
            .catch(() => {});
        }
      })
      .catch(() => alive && setDoctor(null));
    return () => {
      alive = false;
    };
  }, [id]);

  if (doctor === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, justifyContent: "center" }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <Screen>
        <Text variant="body" color="muted">
          의료진을 찾을 수 없습니다.
        </Text>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <Screen contentStyle={{ paddingBottom: 140 }}>
        {/* 뒤로 */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.back, { backgroundColor: colors.surface, borderColor: colors.line }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.content} />
        </Pressable>

        {/* 헤더 */}
        <View style={{ alignItems: "center", marginTop: spacing.x4, gap: 10 }}>
          <Avatar name={doctor.name} size={88} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text variant="h1">{doctor.name}</Text>
            {doctor.verified ? (
              <Ionicons name="shield-checkmark" size={20} color={colors.brand} />
            ) : null}
          </View>
          <Text variant="body" color="muted">
            {doctor.specialty} · {doctor.org}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <Badge tone="success" label="기관 승인" />
            <Badge tone="brand" label="면허 검증" />
          </View>
        </View>

        {/* 지표 */}
        <Card style={{ flexDirection: "row", marginTop: spacing.x6 }}>
          <Stat
            value={(reviews && reviews.count > 0 ? reviews.average : doctor.rating).toFixed(1)}
            label="평점"
            icon="star"
          />
          <Divider />
          <Stat value={`${reviews ? reviews.count : doctor.reviews}`} label="리뷰" />
          <Divider />
          <Stat value={doctor.nextSlot.replace(" ", "\n")} label="가장 빠른" small />
        </Card>

        {/* 소개 */}
        <View style={{ marginTop: spacing.x6, gap: spacing.x2 }}>
          <Text variant="h3">소개</Text>
          <Text variant="body" color="muted" style={{ lineHeight: 24 }}>
            {doctor.about}
          </Text>
        </View>

        {/* 가능한 시간 */}
        <View style={{ marginTop: spacing.x6, gap: spacing.x3 }}>
          <Text variant="h3">가능한 시간</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {slots.map((s) => {
              const active = picked === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setPicked(s)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: radius.md,
                    backgroundColor: active ? colors.brand : colors.surface,
                    borderWidth: 1,
                    borderColor: active ? colors.brand : colors.line,
                  }}
                >
                  <Text
                    variant="small"
                    style={{
                      color: active ? colors.onBrand : colors.content,
                      fontWeight: "600",
                    }}
                  >
                    {s}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 후기 */}
        {reviews && reviews.reviews.length > 0 ? (
          <View style={{ marginTop: spacing.x6, gap: spacing.x3 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text variant="h3">환자 후기</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="star" size={15} color={palette.warning} />
                <Text variant="small" color="muted">
                  {reviews.average.toFixed(1)} · {reviews.count}개
                </Text>
              </View>
            </View>
            {reviews.reviews.slice(0, 5).map((r) => (
              <Card key={r.id} style={{ gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text variant="small" style={{ fontWeight: "700" }}>
                    {r.patientName ?? "익명"}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 1 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Ionicons
                        key={n}
                        name={n <= r.rating ? "star" : "star-outline"}
                        size={13}
                        color={n <= r.rating ? palette.warning : colors.line}
                      />
                    ))}
                  </View>
                </View>
                {r.comment ? (
                  <Text variant="small" color="muted" style={{ lineHeight: 20 }}>
                    {r.comment}
                  </Text>
                ) : null}
              </Card>
            ))}
          </View>
        ) : null}
      </Screen>

      {/* 하단 고정 CTA */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 12,
            backgroundColor: colors.surface,
            borderTopColor: colors.line,
          },
        ]}
      >
        <Button
          label={picked ? `${picked} 예약하기` : "시간을 선택하세요"}
          full
          onPress={() => {
            // 예약 전 응급 스크리닝 + 필수 고지·동의 단계를 거친다.
            if (picked) router.push(`/eligibility/${doctor.id}`);
          }}
        />
      </View>
    </View>
  );
}

function Stat({
  value,
  label,
  icon,
  small,
}: {
  value: string;
  label: string;
  icon?: "star";
  small?: boolean;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 3 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {icon ? <Ionicons name="star" size={15} color={palette.warning} /> : null}
        <Text variant={small ? "small" : "h3"} center>
          {value}
        </Text>
      </View>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ width: 1, backgroundColor: colors.line, marginVertical: 4 }} />;
}

const styles = StyleSheet.create({
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
