import { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Text } from "@/components/Text";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { useAppointment } from "@/lib/useAppointment";
import { DEMO_MODE } from "@/lib/config";
import { useAuth } from "@/context/AuthContext";
import {
  getOrCreateSession,
  getChatHistory,
  connectChat,
  type ChatSocket,
} from "@/api/chat";

type Msg = { id: string; me: boolean; text: string };

let seq = 0;

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const { user } = useAuth();
  const appt = useAppointment(id);
  const doctorName = appt?.doctorName ?? "담당 의료진";

  const [messages, setMessages] = useState<Msg[]>(
    DEMO_MODE
      ? [{ id: "m0", me: false, text: `안녕하세요, ${doctorName}입니다. 어떤 점이 불편하신가요?` }]
      : [],
  );
  const [input, setInput] = useState("");
  const socketRef = useRef<ChatSocket | null>(null);

  // 실서버 모드: 세션 확보 → 이력 로드 → WebSocket 연결.
  useEffect(() => {
    if (DEMO_MODE) return;
    let alive = true;
    (async () => {
      try {
        const session = await getOrCreateSession(String(id));
        if (!alive) return;
        const history = await getChatHistory(session.id);
        if (!alive) return;
        setMessages(
          history.map((h) => ({
            id: `h${h.id}`,
            me: h.senderId === user?.id,
            text: h.content,
          })),
        );
        const sock = await connectChat(session.id, (m) => {
          setMessages((prev) => [
            ...prev,
            { id: `s${seq++}`, me: m.senderId === user?.id, text: m.content },
          ]);
          setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 30);
        });
        if (alive) socketRef.current = sock;
        else sock?.close();
      } catch {
        // 연결 실패 시 조용히 무시
      }
    })();
    return () => {
      alive = false;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [id, user?.id]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (!DEMO_MODE) {
      // 서버가 발신자 포함 브로드캐스트하므로 로컬 에코는 하지 않는다(중복 방지).
      socketRef.current?.send(text);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
      return;
    }

    // 데모: 로컬 에코 + 자동 응답
    setMessages((prev) => [...prev, { id: `u${seq++}`, me: true, text }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `d${seq++}`, me: false, text: "네, 말씀 감사합니다. 증상을 확인하고 안내드릴게요." },
      ]);
      scroll.current?.scrollToEnd({ animated: true });
    }, 900);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header title={doctorName} />
      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.x5, gap: spacing.x3 }}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((m) => (
          <View
            key={m.id}
            style={{
              alignSelf: m.me ? "flex-end" : "flex-start",
              maxWidth: "82%",
              backgroundColor: m.me ? colors.brand : colors.surface,
              borderWidth: m.me ? 0 : 1,
              borderColor: colors.line,
              borderRadius: radius.lg,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text
              variant="body"
              style={{ color: m.me ? "#fff" : colors.content, lineHeight: 22 }}
            >
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.bar,
          {
            paddingBottom: insets.bottom + 10,
            backgroundColor: colors.surface,
            borderTopColor: colors.line,
          },
        ]}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="메시지를 입력하세요"
          placeholderTextColor={colors.subtle}
          style={{
            flex: 1,
            backgroundColor: colors.surface2,
            borderRadius: 999,
            paddingHorizontal: 16,
            paddingVertical: 11,
            color: colors.content,
            fontSize: 15,
          }}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable
          onPress={send}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: palette.primary[500],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-up" size={22} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
});
