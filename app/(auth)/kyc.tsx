import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { requestKyc, verifyKyc } from "@/api/kyc";

type Step = "phone" | "code" | "done";

export default function Kyc() {
  const { spacing, colors } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await requestKyc("SMS", { phone });
      setRequestId(res.requestId);
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "인증 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!requestId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await verifyKyc(requestId, code);
      if (res.status === "VERIFIED") setStep("done");
      else setError("인증에 실패했습니다. 코드를 확인해 주세요.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "인증에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="본인확인" />
      <Screen>
        {/* 진행 표시 */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: spacing.x6 }}>
          {["phone", "code", "done"].map((s, i) => (
            <View
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor:
                  ["phone", "code", "done"].indexOf(step) >= i ? colors.brand : colors.line,
              }}
            />
          ))}
        </View>

        {step === "phone" && (
          <>
            <Text variant="h1">휴대폰 본인확인</Text>
            <Text variant="body" color="muted" style={{ marginTop: 4, marginBottom: spacing.x6 }}>
              안전한 진료와 처방을 위해 본인확인이 필요해요.
            </Text>
            <Input
              label="휴대폰 번호"
              icon="call-outline"
              placeholder="010-1234-5678"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={error ?? undefined}
            />
            <Button
              label={loading ? "요청 중…" : "인증번호 받기"}
              full
              onPress={sendCode}
              style={{ marginTop: spacing.x6 }}
            />
          </>
        )}

        {step === "code" && (
          <>
            <Text variant="h1">인증번호 입력</Text>
            <Text variant="body" color="muted" style={{ marginTop: 4, marginBottom: spacing.x6 }}>
              {phone || "휴대폰"} 으로 전송된 6자리 숫자를 입력하세요.
            </Text>
            <Input
              label="인증번호"
              icon="keypad-outline"
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
              error={error ?? undefined}
            />
            <Pressable onPress={sendCode} style={{ alignSelf: "flex-start", marginTop: 10 }}>
              <Text variant="small" color="brandInk">
                인증번호 재전송
              </Text>
            </Pressable>
            <Button
              label={loading ? "확인 중…" : "확인"}
              full
              onPress={confirm}
              style={{ marginTop: spacing.x6 }}
            />
          </>
        )}

        {step === "done" && (
          <View style={{ alignItems: "center", paddingTop: spacing.x8 }}>
            <View style={[styles.check, { backgroundColor: palette.primary[50] }]}>
              <Ionicons name="checkmark-circle" size={64} color={colors.brand} />
            </View>
            <Text variant="h1" center style={{ marginTop: spacing.x5 }}>
              본인확인 완료
            </Text>
            <Text variant="body" color="muted" center style={{ marginTop: 8, maxWidth: 300 }}>
              이제 MediView의 모든 기능을 이용할 수 있어요.
            </Text>
            <Card style={{ width: "100%", marginTop: spacing.x6, gap: 10 }}>
              {[
                "연계정보(CI) 암호화 저장",
                "진료·처방 시 본인 인증",
                "타인 도용 방지",
              ].map((t) => (
                <View key={t} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="shield-checkmark" size={16} color={colors.brand} />
                  <Text variant="small" color="muted">
                    {t}
                  </Text>
                </View>
              ))}
            </Card>
            <Button
              label="시작하기"
              full
              onPress={() => router.replace("/(tabs)")}
              style={{ marginTop: spacing.x6 }}
            />
          </View>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  check: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
});
