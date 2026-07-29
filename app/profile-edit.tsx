import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { useAuth } from "@/context/AuthContext";

export default function ProfileEdit() {
  const { spacing } = useTheme();
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [birthdate, setBirthdate] = useState(user?.birthdate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim(), birthdate: birthdate.trim() });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header title="프로필 수정" />
      <Screen>
        <View style={{ gap: spacing.x4 }}>
          <Input label="이름" icon="person-outline" value={name} onChangeText={setName} placeholder="이름" />
          <Input
            label="휴대폰"
            icon="call-outline"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="010-1234-5678"
          />
          <Input
            label="생년월일"
            icon="calendar-outline"
            value={birthdate}
            onChangeText={setBirthdate}
            placeholder="1990-01-01"
            error={error ?? undefined}
          />
        </View>
        <Button
          label={saving ? "저장 중…" : "저장"}
          loading={saving}
          full
          onPress={save}
          style={{ marginTop: spacing.x6 }}
        />
      </Screen>
    </>
  );
}
