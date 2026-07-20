import { useState } from "react";
import { View, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { submitReview } from "@/api/reviews";
import { useToast } from "@/components/Toast";

const LABELS = ["", "별로예요", "그저 그래요", "괜찮아요", "좋아요", "최고예요"];

export default function Review() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const toast = useToast();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating < 1) {
      Alert.alert("평점 선택", "별점을 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(String(id), rating, comment.trim());
      toast.show("소중한 후기가 등록되었어요. 감사합니다!");
      router.back();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "등록에 실패했어요. 잠시 후 다시 시도해 주세요.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header title="진료 후기" />
      <Screen>
        <Text variant="h2" center style={{ marginTop: spacing.x4 }}>
          진료는 어떠셨나요?
        </Text>
        <Text variant="body" color="muted" center style={{ marginTop: 4 }}>
          후기는 다른 환자분들께 큰 도움이 됩니다.
        </Text>

        {/* 별점 */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: spacing.x8 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => setRating(n)}
              hitSlop={6}
              accessibilityLabel={`별점 ${n}점`}
            >
              <Ionicons
                name={n <= rating ? "star" : "star-outline"}
                size={40}
                color={n <= rating ? palette.warning : colors.line}
              />
            </Pressable>
          ))}
        </View>
        <Text variant="body" color="brandInk" center style={{ marginTop: spacing.x3, minHeight: 22 }}>
          {LABELS[rating]}
        </Text>

        {/* 코멘트 */}
        <View
          style={{
            marginTop: spacing.x6,
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.line,
            padding: 14,
          }}
        >
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="어떤 점이 좋았는지, 아쉬웠는지 알려주세요. (선택)"
            placeholderTextColor={colors.subtle}
            multiline
            style={{ minHeight: 120, color: colors.content, fontSize: 15, textAlignVertical: "top" }}
          />
        </View>

        <Button
          label={submitting ? "등록 중…" : "후기 등록"}
          full
          onPress={submit}
          style={{ marginTop: spacing.x6 }}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}
