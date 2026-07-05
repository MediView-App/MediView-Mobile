import { useState } from "react";
import { View, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, Link } from "expo-router";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { spacing } = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), pw);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header title="로그인" />
      <Screen>
        <Text variant="h1" style={{ marginTop: spacing.x2 }}>
          다시 오셨네요 👋
        </Text>
        <Text variant="body" color="muted" style={{ marginTop: 4, marginBottom: spacing.x6 }}>
          계정으로 로그인해 진료를 이어가세요.
        </Text>

        <View style={{ gap: spacing.x4 }}>
          <Input
            label="이메일"
            icon="mail-outline"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="비밀번호"
            icon="lock-closed-outline"
            placeholder="비밀번호"
            secure
            value={pw}
            onChangeText={setPw}
            error={error ?? undefined}
          />
          <Pressable style={{ alignSelf: "flex-end" }}>
            <Text variant="small" color="brandInk">
              비밀번호를 잊으셨나요?
            </Text>
          </Pressable>
        </View>

        <Button
          label={loading ? "로그인 중…" : "로그인"}
          full
          onPress={submit}
          style={{ marginTop: spacing.x6 }}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 4,
            marginTop: spacing.x6,
          }}
        >
          <Text variant="small" color="muted">
            아직 계정이 없으신가요?
          </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text variant="small" color="brandInk" style={{ fontWeight: "700" }}>
                회원가입
              </Text>
            </Pressable>
          </Link>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
