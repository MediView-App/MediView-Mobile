import { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";

type Pharmacy = {
  id: string;
  name: string;
  distance: string;
  hours: string;
  open: boolean;
};

// 데모용 약국 목록. 실서버에서는 위치 기반 약국 검색 API 로 대체한다.
const PHARMACIES: Pharmacy[] = [
  { id: "p1", name: "건강온누리약국", distance: "0.3km", hours: "09:00 – 21:00", open: true },
  { id: "p2", name: "미소드림약국", distance: "0.6km", hours: "08:30 – 20:00", open: true },
  { id: "p3", name: "튼튼365약국", distance: "1.1km", hours: "24시간", open: true },
  { id: "p4", name: "행복한약국", distance: "1.4km", hours: "10:00 – 19:00", open: false },
];

type Method = "visit" | "delivery";
type Step = "select" | "method" | "sent";
const TIMELINE = ["처방전 접수", "조제 중", "수령 준비 완료"];

export default function PharmacySend() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("select");
  const [picked, setPicked] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>("visit");
  const [address, setAddress] = useState("");
  const [sending, setSending] = useState(false);

  const pharmacy = PHARMACIES.find((p) => p.id === picked) ?? null;

  const send = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStep("sent");
    }, 900);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <Header title="약국으로 전송" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120, gap: spacing.x4 }}>
        {step === "select" && (
          <>
            <Text variant="h2">약국 선택</Text>
            <Text variant="body" color="muted" style={{ marginTop: 2 }}>
              처방전을 전송할 약국을 선택하세요.
            </Text>
            <View style={{ gap: spacing.x2, marginTop: spacing.x2 }}>
              {PHARMACIES.map((p) => {
                const on = picked === p.id;
                return (
                  <Pressable key={p.id} onPress={() => p.open && setPicked(p.id)} disabled={!p.open}>
                    <Card
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        opacity: p.open ? 1 : 0.5,
                        borderColor: on ? colors.brand : colors.line,
                        borderWidth: 1,
                      }}
                    >
                      <Ionicons
                        name={on ? "radio-button-on" : "radio-button-off"}
                        size={22}
                        color={on ? colors.brand : colors.subtle}
                      />
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyStrong">{p.name}</Text>
                        <Text variant="small" color="muted">
                          {p.distance} · {p.hours}
                        </Text>
                      </View>
                      {!p.open ? (
                        <Text variant="caption" color="subtle">
                          영업종료
                        </Text>
                      ) : null}
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {step === "method" && pharmacy && (
          <>
            <Text variant="h2">수령 방식</Text>
            <Card style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="storefront-outline" size={18} color={colors.brand} />
              <Text variant="body">{pharmacy.name}</Text>
            </Card>

            <View style={{ flexDirection: "row", gap: spacing.x2 }}>
              <MethodCard
                icon="walk-outline"
                label="방문 수령"
                active={method === "visit"}
                onPress={() => setMethod("visit")}
              />
              <MethodCard
                icon="cube-outline"
                label="택배 배송"
                active={method === "delivery"}
                onPress={() => setMethod("delivery")}
              />
            </View>

            {method === "delivery" ? (
              <>
                <Input
                  label="배송지 주소"
                  icon="location-outline"
                  placeholder="주소를 입력하세요"
                  value={address}
                  onChangeText={setAddress}
                />
                <Card style={{ flexDirection: "row", gap: 8, backgroundColor: colors.surface2 }}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
                  <Text variant="caption" color="muted" style={{ flex: 1, lineHeight: 18 }}>
                    의약품 택배 배송은 관련 법령·고시가 정한 조건에서만 가능합니다. 조건 미충족 시
                    방문 수령으로 안내될 수 있습니다.
                  </Text>
                </Card>
              </>
            ) : (
              <Card style={{ flexDirection: "row", gap: 8, backgroundColor: colors.surface2 }}>
                <Ionicons name="time-outline" size={16} color={colors.muted} />
                <Text variant="caption" color="muted" style={{ flex: 1, lineHeight: 18 }}>
                  조제가 완료되면 알림을 보내드립니다. 신분증을 지참하고 방문해 주세요.
                </Text>
              </Card>
            )}
          </>
        )}

        {step === "sent" && pharmacy && (
          <View style={{ alignItems: "center", paddingTop: spacing.x6 }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: palette.primary[50],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark-circle" size={56} color={colors.brand} />
            </View>
            <Text variant="h2" center style={{ marginTop: spacing.x5 }}>
              처방전을 전송했어요
            </Text>
            <Text variant="body" color="muted" center style={{ marginTop: 6 }}>
              {pharmacy.name} · {method === "visit" ? "방문 수령" : "택배 배송"}
            </Text>

            {/* 조제 상태 타임라인 */}
            <Card style={{ width: "100%", marginTop: spacing.x6, gap: 0 }}>
              {TIMELINE.map((t, i) => {
                const active = i === 0; // 데모: 접수 단계
                return (
                  <View key={t} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
                    <Ionicons
                      name={active ? "ellipse" : "ellipse-outline"}
                      size={16}
                      color={active ? colors.brand : colors.subtle}
                    />
                    <Text variant="body" color={active ? "content" : "muted"}>
                      {t}
                    </Text>
                    {active ? (
                      <Text variant="caption" color="brandInk" style={{ marginLeft: "auto" }}>
                        진행 중
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </Card>
          </View>
        )}
      </ScrollView>

      {/* 하단 액션 */}
      <View
        style={{
          padding: 20,
          paddingBottom: insets.bottom + 12,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.line,
        }}
      >
        {step === "select" && (
          <Button
            label="다음"
            full
            disabled={!picked}
            onPress={() => setStep("method")}
          />
        )}
        {step === "method" && (
          <Button
            label={sending ? "전송 중…" : "처방전 전송"}
            full
            disabled={method === "delivery" && !address.trim()}
            onPress={send}
          />
        )}
        {step === "sent" && (
          <Button label="완료" full onPress={() => router.replace("/documents")} />
        )}
      </View>
    </View>
  );
}

function MethodCard({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        gap: 6,
        paddingVertical: 18,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: active ? colors.brand : colors.line,
        backgroundColor: active ? colors.surface : colors.surface2,
      }}
    >
      <Ionicons name={icon} size={22} color={active ? colors.brand : colors.muted} />
      <Text variant="small" color={active ? "content" : "muted"} style={{ fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}
