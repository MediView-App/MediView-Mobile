import { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";

const EMERGENCY_SIGNS = [
  "의식 저하 · 심한 어지럼",
  "갑작스러운 심한 흉통 · 호흡곤란",
  "한쪽 마비 · 말이 어눌해짐",
  "멈추지 않는 출혈 · 심한 외상",
  "음독 · 심한 알레르기 반응",
];

type Consent = {
  terms: boolean;
  privacy: boolean;
  sensitive: boolean;
  telemedicine: boolean;
  marketing: boolean;
};

const REQUIRED: (keyof Consent)[] = ["terms", "privacy", "sensitive", "telemedicine"];

export default function Eligibility() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"screen" | "blocked" | "consent">("screen");
  const [consent, setConsent] = useState<Consent>({
    terms: false,
    privacy: false,
    sensitive: false,
    telemedicine: false,
    marketing: false,
  });

  const allRequired = REQUIRED.every((k) => consent[k]);
  const allChecked = (Object.keys(consent) as (keyof Consent)[]).every((k) => consent[k]);

  const toggle = (k: keyof Consent) => setConsent((c) => ({ ...c, [k]: !c[k] }));
  const toggleAll = () => {
    const next = !allChecked;
    setConsent({ terms: next, privacy: next, sensitive: next, telemedicine: next, marketing: next });
  };

  const proceed = () => router.replace(`/booking/${id}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <Header title="진료 전 확인" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120, gap: spacing.x5 }}>
        {/* 진행 표시 */}
        <View style={{ flexDirection: "row", gap: 6 }}>
          {["screen", "consent"].map((s, i) => (
            <View
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor:
                  (step === "consent" ? 1 : 0) >= i ? colors.brand : colors.line,
              }}
            />
          ))}
        </View>

        {step !== "consent" ? (
          <>
            <Text variant="h2">응급 증상 확인</Text>
            <Text variant="body" color="muted" style={{ marginTop: 2 }}>
              비대면 진료는 경증·만성질환 관리에 적합해요. 아래와 같은 응급 증상은 즉시
              대면 진료나 119가 필요합니다.
            </Text>
            <Card style={{ gap: 10 }}>
              {EMERGENCY_SIGNS.map((s) => (
                <View key={s} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Ionicons name="alert-circle" size={18} color={palette.danger} />
                  <Text variant="small" style={{ flex: 1 }}>
                    {s}
                  </Text>
                </View>
              ))}
            </Card>

            {step === "blocked" ? (
              <Card style={{ gap: 10, borderColor: palette.danger, borderWidth: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="warning" size={20} color={palette.danger} />
                  <Text variant="bodyStrong" style={{ color: palette.danger }}>
                    응급 상황일 수 있어요
                  </Text>
                </View>
                <Text variant="small" color="muted" style={{ lineHeight: 20 }}>
                  비대면 진료 대상이 아닙니다. 즉시 119에 연락하거나 가까운 응급실을
                  방문하세요. 지체는 위험할 수 있습니다.
                </Text>
              </Card>
            ) : null}

            <View style={{ gap: spacing.x2 }}>
              <Button label="위 증상이 없어요 · 계속하기" full onPress={() => setStep("consent")} />
              <Button
                label="해당 증상이 있어요"
                variant="secondary"
                full
                onPress={() => setStep("blocked")}
              />
            </View>
          </>
        ) : (
          <>
            <Text variant="h2">고지 및 동의</Text>
            <Text variant="body" color="muted" style={{ marginTop: 2 }}>
              안전한 비대면 진료를 위해 아래 내용을 확인하고 동의해 주세요.
            </Text>

            <Card style={{ gap: 6, backgroundColor: colors.surface2 }}>
              <Text variant="caption" color="muted" style={{ lineHeight: 19 }}>
                비대면 진료는 대면 진료를 완전히 대체하지 않으며, 의료진의 판단에 따라
                대면 진료가 권고될 수 있습니다. 진단·처방의 한계가 있을 수 있습니다.
              </Text>
            </Card>

            {/* 전체 동의 */}
            <Pressable onPress={toggleAll}>
              <Card
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderColor: allChecked ? colors.brand : colors.line,
                  borderWidth: 1,
                }}
              >
                <Check on={allChecked} />
                <Text variant="bodyStrong">전체 동의하기</Text>
              </Card>
            </Pressable>

            <View style={{ gap: 2 }}>
              <ConsentRow
                label="[필수] 서비스 이용약관"
                on={consent.terms}
                onToggle={() => toggle("terms")}
                onView={() => router.push("/legal/terms")}
              />
              <ConsentRow
                label="[필수] 개인정보 수집·이용 동의"
                on={consent.privacy}
                onToggle={() => toggle("privacy")}
                onView={() => router.push("/legal/privacy")}
              />
              <ConsentRow
                label="[필수] 민감정보(건강정보) 처리 동의"
                on={consent.sensitive}
                onToggle={() => toggle("sensitive")}
                onView={() => router.push("/legal/sensitive")}
              />
              <ConsentRow
                label="[필수] 비대면 진료 특성·한계 고지 확인"
                on={consent.telemedicine}
                onToggle={() => toggle("telemedicine")}
                onView={() => router.push("/legal/telemedicine")}
              />
              <ConsentRow
                label="[선택] 혜택·마케팅 정보 수신"
                on={consent.marketing}
                onToggle={() => toggle("marketing")}
              />
            </View>
          </>
        )}
      </ScrollView>

      {step === "consent" ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 20,
            paddingBottom: insets.bottom + 12,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.line,
          }}
        >
          <Button
            label={allRequired ? "동의하고 예약 진행" : "필수 항목에 동의해 주세요"}
            full
            disabled={!allRequired}
            onPress={proceed}
          />
        </View>
      ) : null}
    </View>
  );
}

function Check({ on }: { on: boolean }) {
  const { colors } = useTheme();
  return (
    <Ionicons
      name={on ? "checkmark-circle" : "ellipse-outline"}
      size={24}
      color={on ? colors.brand : colors.subtle}
    />
  );
}

function ConsentRow({
  label,
  on,
  onToggle,
  onView,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  onView?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 }}>
      <Pressable onPress={onToggle} hitSlop={6}>
        <Check on={on} />
      </Pressable>
      <Text variant="small" style={{ flex: 1 }} onPress={onToggle}>
        {label}
      </Text>
      {onView ? (
        <Pressable onPress={onView} hitSlop={6}>
          <Text variant="small" color="brandInk">
            보기
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
