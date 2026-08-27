import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton, Icon, Page, ScreenHeader } from "../components/UI";
import { builtInDocuments } from "../data/content";
import { prepareBuiltInDocument } from "../services/documents";
import { useApp } from "../state/AppContext";
import type { BuiltInDocument, RootStackParamList } from "../types";
import { colors } from "../theme";

export default function DownloadsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Downloads">) {
  const { t } = useApp();
  const [ready, setReady] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const prepare = async (doc: BuiltInDocument) => {
    setBusy(doc.id);
    try {
      const uri = await prepareBuiltInDocument(doc);
      setReady((v) => ({ ...v, [doc.id]: uri }));
      navigation.navigate("DocumentReader", { document: { ...doc, uri } });
    } catch (e) {
      Alert.alert(
        "Unable to prepare document",
        e instanceof Error ? e.message : "Please try again.",
      );
    } finally {
      setBusy(null);
    }
  };
  const all = async () => {
    for (const doc of builtInDocuments) {
      setBusy(doc.id);
      try {
        const uri = await prepareBuiltInDocument(doc);
        setReady((v) => ({ ...v, [doc.id]: uri }));
      } catch {}
    }
    setBusy(null);
  };
  return (
    <Page>
      <BackButton navigation={navigation} label={t.songs} />
      <ScreenHeader
        eyebrow={t.availableOffline}
        title={t.downloads}
        subtitle={t.downloadsSub}
      />
      <Pressable style={s.all} onPress={all}>
        <Icon name="cloud-download" color={colors.ink} />
        <Text style={s.allText}>
          {Object.keys(ready).length === builtInDocuments.length
            ? t.allReady
            : t.downloadAll}
        </Text>
      </Pressable>
      {builtInDocuments.map((doc) => (
        <View key={doc.id} style={s.card}>
          <View style={s.cover}>
            <Icon name="document-text" color={colors.gold} />
            <Text style={s.type}>{doc.type}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.category}>{doc.category}</Text>
            <Text style={s.title}>{doc.title}</Text>
            <Text style={s.meta}>
              {ready[doc.id] ? t.availableOffline : doc.subtitle}
            </Text>
          </View>
          <Pressable
            style={[s.action, ready[doc.id] && s.actionReady]}
            onPress={() =>
              ready[doc.id]
                ? navigation.navigate("DocumentReader", {
                    document: { ...doc, uri: ready[doc.id] },
                  })
                : prepare(doc)
            }
          >
            {busy === doc.id ? (
              <ActivityIndicator color={colors.gold} />
            ) : (
              <Icon
                name={ready[doc.id] ? "book" : "download-outline"}
                color={ready[doc.id] ? colors.ink : colors.gold}
              />
            )}
          </Pressable>
        </View>
      ))}
    </Page>
  );
}
const s = StyleSheet.create({
  all: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.gold,
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  allText: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  card: {
    minHeight: 100,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 11,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  cover: {
    width: 62,
    height: 76,
    borderRadius: 14,
    backgroundColor: "#3D2B11",
    alignItems: "center",
    justifyContent: "center",
  },
  type: { color: colors.gold, fontSize: 7, fontWeight: "900", marginTop: 7 },
  category: {
    color: colors.gold,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  title: {
    color: colors.cream,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    marginTop: 5,
  },
  meta: { color: colors.muted, fontSize: 9, marginTop: 5 },
  action: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(233,185,73,.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionReady: { backgroundColor: colors.gold },
});
