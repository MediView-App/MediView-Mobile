import { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { SkeletonList } from "@/components/Skeleton";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { docTypeLabel, type DocType, type MedDocument } from "@/lib/mock";
import { listDocuments } from "@/api/documents";

const iconByType: Record<DocType, keyof typeof Ionicons.glyphMap> = {
  PRESCRIPTION: "medkit",
  CONFIRMATION: "checkmark-done",
  OPINION: "document-text",
};

export default function Documents() {
  const { colors, spacing } = useTheme();
  const [documents, setDocuments] = useState<MedDocument[] | null>(null);

  useEffect(() => {
    let alive = true;
    listDocuments()
      .then((list) => alive && setDocuments(list))
      .catch(() => alive && setDocuments([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Header title="서류함" />
      <Screen>
        {documents === null ? (
          <SkeletonList count={3} />
        ) : documents.length ? (
          <View style={{ gap: spacing.x2 }}>
            {documents.map((d) => (
              <Link key={d.id} href={`/documents/${d.id}`} asChild>
                <Pressable>
                  <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={[styles.icon, { backgroundColor: palette.primary[50] }]}>
                      <Ionicons name={iconByType[d.type]} size={22} color={colors.brand} />
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text variant="bodyStrong">{d.title}</Text>
                      <Text variant="small" color="muted">
                        {d.doctor} · {d.org} · {d.issuedAt}
                      </Text>
                    </View>
                    <Badge tone="success" label={docTypeLabel[d.type]} />
                  </Card>
                </Pressable>
              </Link>
            ))}
          </View>
        ) : (
          <EmptyState icon="document-text-outline" title="발급된 서류가 없어요" />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
