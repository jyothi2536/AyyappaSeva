import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SegmentedControl from "../components/SegmentedControl";
import YouTubeVideos from "../components/YouTubeVideos";
import LiveCard from "../components/LiveCard";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon, Page, ScreenHeader } from "../components/UI";
import { builtInDocuments, scriptureFeatureCopy } from "../data/content";
import { prepareBuiltInDocument } from "../services/documents";
import { useApp } from "../state/AppContext";
import type { BuiltInDocument, RootStackParamList, Song } from "../types";
import { colors } from "../theme";

type ResourceSection = "songs" | "books";
const SECTION_KEY = "resourcesSection";

const FEATURED_DOCUMENT_IDS = new Set([
  "mahishasura-mardini-four-languages",
  "lingashtakam-four-languages",
  "bilvashtakam-four-languages",
  "hanuman-chalisa-four-languages",
  "kala-bhairava-ashtakam-four-languages",
]);

export default function SongsScreen() {
  const { t, songs, language } = useApp();
  const [preparingDocument, setPreparingDocument] = useState<string | null>(null);
  const [section, setSection] = useState<ResourceSection>("songs");
  const touchX = useRef(0);
  useEffect(() => {
    AsyncStorage.getItem(SECTION_KEY).then((v) => {
      if (v === "songs" || v === "books") setSection(v);
    });
  }, []);
  const selectSection = (next: ResourceSection) => {
    setSection(next);
    void AsyncStorage.setItem(SECTION_KEY, next);
  };
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const open = (song: Song) => {
    if (song.id === "1") return navigation.navigate("Harivarasanam");
    if (song.id === "3")
      return navigation.navigate("Lyrics", { kind: "saranams108" });
    if (song.id === "4")
      return navigation.navigate("Lyrics", { kind: "deepaaradhana" });
    if (song.uri)
      return navigation.navigate("DocumentReader", { document: song });
    Alert.alert(song.title, "Audio will be added by a temple administrator.");
  };
  const scripture = scriptureFeatureCopy[language];
  // Featured stotrams first, then every other bundled book.
  const featuredDocuments = [
    ...builtInDocuments.filter((document) => FEATURED_DOCUMENT_IDS.has(document.id)),
    ...builtInDocuments.filter((document) => !FEATURED_DOCUMENT_IDS.has(document.id)),
  ];
  const openBuiltInDocument = async (document: BuiltInDocument) => {
    try {
      setPreparingDocument(document.id);
      const uri = await prepareBuiltInDocument(document);
      navigation.navigate("DocumentReader", { document: { ...document, uri } });
    } catch (error) {
      Alert.alert(
        "Unable to open document",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setPreparingDocument(null);
    }
  };
  return (
    <Page>
      <ScreenHeader
        eyebrow={t.listen}
        title={t.library}
        subtitle={t.librarySub}
      />
      <LiveCard />
      <SegmentedControl
        segments={[
          { key: "songs", label: "Bhajan Songs", icon: "musical-notes-outline" },
          { key: "books", label: "Bhajan Books", icon: "book-outline" },
        ]}
        value={section}
        onChange={selectSection}
      />
      <View
        onTouchStart={(e) => (touchX.current = e.nativeEvent.pageX)}
        onTouchEnd={(e) => {
          const dx = e.nativeEvent.pageX - touchX.current;
          if (dx < -70 && section === "songs") selectSection("books");
          else if (dx > 70 && section === "books") selectSection("songs");
        }}
      >
      {section === "songs" ? (
      <>
      <Pressable
        style={s.feature}
        onPress={() => navigation.navigate("Scriptures")}
      >
        <LinearGradient
          colors={[colors.greenSoft, "#F4FAF5"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.featureIcon}>
          <Icon name="headset" color={colors.success} size={27} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.badge}>{scripture.badge}</Text>
          <Text style={s.featureTitle}>{scripture.title}</Text>
          <Text style={s.featureSub}>{scripture.subtitle}</Text>
        </View>
        <Icon name="chevron-forward" color={colors.success} />
      </Pressable>
      <Text style={s.label}>BHAJAN SONGS</Text>
      <View style={s.list}>
        {songs.filter((song) => song.type === "AUDIO").map((song) => (
          <Pressable key={song.id} onPress={() => open(song)} style={s.row}>
            <View
              style={[
                s.cover,
                {
                  backgroundColor:
                    song.type === "AUDIO" ? colors.greenSoft : "#FFF1DA",
                },
              ]}
            >
              <Icon
                name={song.type === "AUDIO" ? "musical-note" : "document-text"}
                color={song.type === "AUDIO" ? colors.success : colors.saffron}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{song.title}</Text>
              <Text style={s.meta}>{song.subtitle}</Text>
            </View>
            <Text style={s.type}>{song.type}</Text>
            <Icon name="chevron-forward" color={colors.muted} size={18} />
          </Pressable>
        ))}
      </View>
      <YouTubeVideos />
      </>
      ) : (
      <>
      <Text style={s.label}>BHAJAN BOOKS</Text>
      <View style={s.list}>
        {songs.filter((song) => song.type === "TXT").map((song) => (
          <Pressable key={song.id} onPress={() => open(song)} style={s.row}>
            <View style={[s.cover, { backgroundColor: "#FFF1DA" }]}>
              <Icon name="document-text" color={colors.saffron} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{song.title}</Text>
              <Text style={s.meta}>{song.subtitle}</Text>
            </View>
            <Text style={s.type}>LYRICS</Text>
            <Icon name="chevron-forward" color={colors.muted} size={18} />
          </Pressable>
        ))}
        {featuredDocuments.map((document) => (
          <Pressable
            key={document.id}
            onPress={() => openBuiltInDocument(document)}
            style={s.row}
            disabled={preparingDocument === document.id}
          >
            <View style={[s.cover, { backgroundColor: "#FFF1DA" }]}>
              <Icon name="document-text" color={colors.saffron} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{document.title}</Text>
              <Text style={s.meta}>
                {preparingDocument === document.id
                  ? t.preparing
                  : document.subtitle}
              </Text>
            </View>
            <Text style={s.type}>{document.type}</Text>
            <Icon name="chevron-forward" color={colors.muted} size={18} />
          </Pressable>
        ))}
      </View>
      </>
      )}
      </View>
      <View style={s.info}>
        <Icon name="shield-checkmark-outline" color={colors.success} />
        <Text style={s.infoText}>
          This library is read-only for devotees. Temple administrators manage
          devotional content.
        </Text>
      </View>
    </Page>
  );
}
const s = StyleSheet.create({
  feature: {
    minHeight: 116,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(30,122,69,.22)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 12,
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: { color: colors.success, fontSize: 8, letterSpacing: 1, fontWeight: "900" },
  featureTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  featureSub: { color: colors.muted, fontSize: 10, marginTop: 5 },
  download: {
    minHeight: 82,
    borderRadius: 20,
    backgroundColor: "#FFF3D9",
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 22,
  },
  downloadIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.goldFill,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { color: colors.muted, fontSize: 10, marginTop: 5 },
  label: {
    color: colors.gold,
    fontSize: 9,
    letterSpacing: 1.6,
    fontWeight: "900",
    marginBottom: 10,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  row: {
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  cover: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: colors.text, fontSize: 14, fontWeight: "800" },
  type: { fontSize: 8, color: colors.gold, fontWeight: "900" },
  info: {
    marginTop: 15,
    padding: 13,
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.greenSoft,
    borderRadius: 14,
  },
  infoText: { color: "#3E5A46", fontSize: 11, lineHeight: 16, flex: 1 },
});
