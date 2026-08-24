import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Pdf from "react-native-pdf-jsi";
import * as FileSystem from "expo-file-system/legacy";
import { BackButton, GoldButton, Icon } from "../components/UI";
import { readDocx } from "../services/documents";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

export default function DocumentReaderScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "DocumentReader">) {
  const document = route.params.document;
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(document.type !== "PDF");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  useEffect(() => {
    if (!document.uri || document.type === "PDF" || document.type === "AUDIO") {
      setLoading(false);
      return;
    }
    const read =
      document.type === "DOCX"
        ? readDocx(document.uri)
        : FileSystem.readAsStringAsync(document.uri);
    read
      .then(setText)
      .catch((e) =>
        setError(
          e instanceof Error ? e.message : "Unable to read this document.",
        ),
      )
      .finally(() => setLoading(false));
  }, [document]);
  const isPdf = document.type === "PDF";
  return (
    <View style={s.root}>
      <View style={s.header}>
        <BackButton navigation={navigation} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={s.title}>
            {document.title}
          </Text>
          <Text style={s.meta}>
            {isPdf
              ? pages
                ? `${page} / ${pages} pages`
                : "PDF document"
              : `${document.type} · In-app reader`}
          </Text>
        </View>
        {!isPdf && document.type !== "AUDIO" && (
          <View style={s.fonts}>
            <Pressable onPress={() => setFontSize((v) => Math.max(14, v - 2))}>
              <Text style={s.font}>A−</Text>
            </Pressable>
            <Pressable onPress={() => setFontSize((v) => Math.min(28, v + 2))}>
              <Text style={s.font}>A+</Text>
            </Pressable>
          </View>
        )}
      </View>
      {isPdf && document.uri ? (
        <View style={s.pdfStage}>
          <Pdf
            source={{ uri: document.uri }}
            style={s.pdf}
            onLoadComplete={setPages}
            onPageChanged={(current, count) => {
              setPage(current);
              setPages(count);
            }}
            onError={(reason) => setError(String(reason))}
          />
          {error ? <Empty icon="alert-circle-outline" text={error} /> : null}
        </View>
      ) : document.type === "AUDIO" ? (
        <View style={s.empty}>
          <Icon name="musical-notes" size={44} color={colors.gold} />
          <Text style={s.emptyTitle}>Audio file</Text>
          <GoldButton
            label="Open audio player"
            icon="open-outline"
            onPress={() => document.uri && Linking.openURL(document.uri)}
          />
        </View>
      ) : loading ? (
        <View style={s.empty}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : error ? (
        <Empty icon="alert-circle-outline" text={error} />
      ) : (
        <ScrollView style={s.paper} contentContainerStyle={s.paperContent}>
          <Text
            selectable
            style={[s.documentText, { fontSize, lineHeight: fontSize * 1.65 }]}
          >
            {text}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}
function Empty({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  text: string;
}) {
  return (
    <View style={s.empty}>
      <Icon name={icon} size={38} color="#D8877E" />
      <Text style={s.error}>{text}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#080806",
    paddingTop: Platform.OS === "android" ? 38 : 0,
  },
  header: {
    minHeight: 82,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  title: { color: colors.cream, fontSize: 15, fontWeight: "800" },
  meta: { color: colors.gold, fontSize: 9, marginTop: 4 },
  fonts: { flexDirection: "row", gap: 6 },
  font: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900",
    padding: 9,
    backgroundColor: "rgba(233,185,73,.08)",
    borderRadius: 9,
  },
  pdfStage: { flex: 1, backgroundColor: "#292929" },
  pdf: { flex: 1, width: "100%", height: "100%" },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 34,
    gap: 14,
  },
  emptyTitle: { color: colors.cream, fontSize: 20, fontWeight: "800" },
  error: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  paper: { flex: 1, margin: 12, borderRadius: 8, backgroundColor: "#FFF9EB" },
  paperContent: { padding: 24 },
  documentText: {
    color: "#2A2419",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
});
