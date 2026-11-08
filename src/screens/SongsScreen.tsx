import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SegmentedControl from "../components/SegmentedControl";
import YouTubeVideos from "../components/YouTubeVideos";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon, Page, ScreenHeader } from "../components/UI";
import { DEITIES, SONG_DEITY, SONG_TABS, type TabLang } from "../data/songCatalog";
import { builtInDocuments } from "../data/content";
import {
  downloadSong,
  listDownloadedSongs,
  prepareBuiltInDocument,
  removeDownloadedSong,
  resolveCloudSong,
} from "../services/documents";
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
  const { t, songs, language, librarySongs } = useApp();
  const [preparingDocument, setPreparingDocument] = useState<string | null>(null);
  const [section, setSection] = useState<ResourceSection>("songs");
  const touchX = useRef(0);
  const [tab, setTab] = useState<TabLang>("te");
  const [query, setQuery] = useState("");
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<string | null>(null);
  useEffect(() => {
    void listDownloadedSongs().then(setDownloaded);
  }, []);
  const toggleDownload = async (docs: BuiltInDocument[]) => {
    const remote = docs.filter((d) => d.remoteUrl);
    if (remote.length === 0) return;
    if (remote.every((d) => downloaded.has(d.id))) {
      for (const d of remote) await removeDownloadedSong(d.id);
      setDownloaded(await listDownloadedSongs());
      return;
    }
    try {
      for (const d of remote) {
        if (downloaded.has(d.id)) continue;
        setDownloading(d.id);
        await downloadSong(d.id, d.remoteUrl!);
      }
      setDownloaded(await listDownloadedSongs());
    } catch (error) {
      Alert.alert("Download failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setDownloading(null);
    }
  };
  const deepaSong = songs.find((x) => x.id === "4");
  const [pujaOpen, setPujaOpen] = useState<"process" | "channel" | null>("process");
  const [openKey, setOpenKey] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    AsyncStorage.getItem("resourcesLang").then((v) => {
      if (v === "te" || v === "ta" || v === "kn") setTab(v);
    });
  }, []);
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
    if (song.id === "1") return navigation.navigate("Harivarasanam", { lang: tab });
    if (song.id === "2")
      return navigation.navigate("VideoPlayer", {
        title: song.title,
        url: "https://m.youtube.com/watch?v=vE5ShJ705kg&t=2s",
      });
    if (song.id === "3")
      return navigation.navigate("Lyrics", { lang: tab, kind: "saranams108" });
    if (song.id === "4")
      return navigation.navigate("Lyrics", { lang: tab, kind: "deepaaradhana" });
    if (song.id === "5")
      return navigation.navigate("Lyrics", { lang: tab, kind: "ashtottara" });
    if (song.id === "6")
      return navigation.navigate("Lyrics", { lang: tab, kind: "durgaAshtottara" });
    if (song.id === "7")
      return navigation.navigate("Lyrics", { lang: tab, kind: "ganeshaAshtottara" });
    if (song.id === "8")
      return navigation.navigate("Lyrics", { lang: tab, kind: "subrahmanyaAshtottara" });
    if (song.uri)
      return navigation.navigate("DocumentReader", { document: song });
    Alert.alert(song.title, "Audio will be added by a temple administrator.");
  };
  const DOC_DEITY: Record<string, string> = {
    "mahishasura-mardini": "durga",
    "neela-malaiyil": "ayyappa",
  };
  const docDeity = (d: BuiltInDocument) => {
    if (d.remoteUrl) return d.deity;
    return DOC_DEITY[d.id.replace(/-(english|telugu|tamil|kannada)$/, "")];
  };
  // Featured stotrams first, then every other bundled book.
  const cloudDocuments: BuiltInDocument[] = librarySongs.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    type: "PDF",
    category: "BHAJAN BOOK",
    lang: s.lang,
    remoteUrl: s.url,
    deity: s.deity && s.deity !== "other" ? s.deity : undefined,
    assetSource: 0,
  }));
  const pujaProcessDoc = builtInDocuments.find((d) => d.id === "atlanta-temple");
  const pujaProcessParts = builtInDocuments.filter((d) => d.id.startsWith("puja-"));
  const visibleDocuments = [...builtInDocuments, ...cloudDocuments].filter(
    (document) => document.id !== "atlanta-temple" && !document.id.startsWith("puja-") &&
      (!document.lang || document.lang === "en" || document.lang === tab),
  );
  const featuredDocuments = [
    ...visibleDocuments.filter((document) => !docDeity(document) && FEATURED_DOCUMENT_IDS.has(document.id.replace(/-(english|telugu|tamil|kannada)$/, "-four-languages"))),
    ...visibleDocuments.filter((document) => !docDeity(document) && !FEATURED_DOCUMENT_IDS.has(document.id.replace(/-(english|telugu|tamil|kannada)$/, "-four-languages"))),
  ];
  const ORDER: { key: string; label: string }[] = [
    { key: "ganesh", label: "Ganesh" },
    { key: "guru", label: "Guru" },
    { key: "durga", label: "Andaal / Durga" },
    { key: "shiva", label: "Shiva" },
    { key: "other", label: "Others" },
    { key: "murugan", label: "Murugan" },
    { key: "ayyappa", label: "Ayyappa" },
  ];
  const known = new Set(ORDER.map((o) => o.key));
  const q = query.trim().toLowerCase();
  const match = (s: string) => !q || s.toLowerCase().includes(q);
  const groups = ORDER.map((d) => ({
    key: d.key,
    label: d.label,
    items: songs.filter((x) => {
      if (x.type !== "TXT" || ["3", "4", "5"].includes(x.id) || !match(x.title)) return false;
      const k = SONG_DEITY[x.id];
      return d.key === "other" ? !k || !known.has(k) : k === d.key;
    }),
    docs: visibleDocuments.filter((x) => {
      if (!match(x.title)) return false;
      const k = docDeity(x);
      return d.key === "other" ? !k || !known.has(k) : k === d.key;
    }),
  }));
  const totalFound = groups.reduce((n, g) => n + g.items.length + g.docs.length, 0);
  const effectiveOpen = openKey === undefined ? groups.find((g) => g.items.length + g.docs.length > 0)?.key ?? null : openKey;
  const baseId = (d: BuiltInDocument) =>
    d.id.replace(/-(english|telugu|tamil|kannada)$/, "");
  const tabLabel = SONG_TABS.find((x) => x.key === tab)?.label ?? "";
  const renderBooks = (docs: BuiltInDocument[]) => {
    const order: string[] = [];
    const map: Record<string, BuiltInDocument[]> = {};
    docs.forEach((d) => {
      const k = baseId(d);
      if (!map[k]) {
        map[k] = [];
        order.push(k);
      }
      map[k]!.push(d);
    });
    return order.map((k) => {
      const group = map[k]!;
      const native = group.find((d) => d.lang === tab);
      const english = group.find((d) => d.lang === "en");
      const single = group.length === 1 ? group[0]! : null;
      const first = group[0]!;
      const remote = group.filter((d) => d.remoteUrl);
      const allDown = remote.length > 0 && remote.every((d) => downloaded.has(d.id));
      const title = first.title;
      const pill = (label: string, doc: BuiltInDocument | undefined, primary: boolean) =>
        doc ? (
          <Pressable
            key={label}
            onPress={() => openBuiltInDocument(doc)}
            disabled={preparingDocument === doc.id}
            style={[s.pill, primary && s.pillOn]}
          >
            <Text style={[s.pillText, primary && s.pillTextOn]}>{label}</Text>
          </Pressable>
        ) : null;
      return (
        <View key={k} style={s.bookRow}>
          <View style={s.cover}>
            <Icon name="document-text" color={colors.saffron} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{title}</Text>
            {single ? (
              <Pressable onPress={() => openBuiltInDocument(single)}>
                <Text style={s.meta}>
                  {preparingDocument === single.id
                    ? t.preparing
                    : downloaded.has(single.id)
                      ? "Downloaded · works offline"
                      : single.subtitle}
                </Text>
              </Pressable>
            ) : (
              <View style={s.pills}>
                {pill(tabLabel, native, true)}
                {pill("English", english, false)}
                {allDown ? <Text style={s.meta}>  · works offline</Text> : null}
              </View>
            )}
          </View>
          {remote.length > 0 ? (
            <Pressable
              onPress={() => toggleDownload(remote)}
              hitSlop={10}
              accessibilityLabel={allDown ? "Remove download" : "Download for offline"}
              style={s.dl}
            >
              {remote.some((d) => d.id === downloading) ? (
                <ActivityIndicator size="small" color={colors.gold} />
              ) : (
                <Icon
                  name={allDown ? "checkmark-circle" : "cloud-download-outline"}
                  color={allDown ? colors.success : colors.muted}
                  size={24}
                />
              )}
            </Pressable>
          ) : null}
        </View>
      );
    });
  };
  const openBuiltInDocument = async (document: BuiltInDocument) => {
    try {
      setPreparingDocument(document.id);
      const uri = document.remoteUrl
        ? await resolveCloudSong(document.id, document.remoteUrl, downloaded.has(document.id))
        : await prepareBuiltInDocument(document);
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
      <SegmentedControl
        segments={[
          { key: "songs", label: "Puja", icon: "musical-notes-outline" },
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
      {([
        { key: "process", label: "Puja Process", count: pujaProcessDoc ? 1 : 0 },
        { key: "channel", label: "Temple Channel", count: 0 },
      ] as const).map((g) => {
        const isOpen = pujaOpen === g.key;
        return (
          <View key={g.key} style={{ marginBottom: 10 }}>
            <Pressable
              onPress={() => setPujaOpen(isOpen ? null : g.key)}
              style={s.groupHead}
            >
              <Text style={s.groupTitle}>{g.label}</Text>
              <Icon name={isOpen ? "chevron-up" : "chevron-down"} color={colors.muted} size={18} />
            </Pressable>
            {isOpen && g.key === "process" && pujaProcessDoc ? (
              <View style={s.list}>
                <Pressable onPress={() => openBuiltInDocument(pujaProcessDoc)} style={s.row}>
                  <View style={[s.cover, { backgroundColor: colors.greenSoft }]}>
                    <Icon name="document-text" color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.title}>{pujaProcessDoc.title}</Text>
                    <Text style={s.meta}>{pujaProcessDoc.subtitle}</Text>
                  </View>
                  <Text style={s.type}>PDF</Text>
                  <Icon name="chevron-forward" color={colors.muted} size={18} />
                </Pressable>
              </View>
            ) : null}
            {isOpen && g.key === "process" ? (
              <View style={s.list}>
                {pujaProcessParts.map((doc) => (
                  <React.Fragment key={doc.id}>
                  <Pressable onPress={() => openBuiltInDocument(doc)} style={s.row}>
                    <View style={[s.cover, { backgroundColor: colors.greenSoft }]}>
                      <Icon name="document-text" color={colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.title}>{doc.title}</Text>
                      <Text style={s.meta}>{doc.subtitle}</Text>
                    </View>
                    <Text style={s.type}>PDF</Text>
                    <Icon name="chevron-forward" color={colors.muted} size={18} />
                  </Pressable>
                  {doc.id === "puja-ayyappa-saranam-108" ? (
                    <Pressable
                      onPress={() => navigation.navigate("Lyrics", { lang: "te", kind: "saranams108" })}
                      style={s.row}
                    >
                      <View style={[s.cover, { backgroundColor: colors.greenSoft }]}>
                        <Icon name="musical-note" color={colors.success} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.title}>108 Saranams - Telugu</Text>
                        <Text style={s.meta}>Complete prayer · Offline lyrics</Text>
                      </View>
                      <Icon name="chevron-forward" color={colors.muted} size={18} />
                    </Pressable>
                  ) : null}
                  </React.Fragment>
                ))}
              </View>
            ) : null}
            {isOpen && g.key === "process" && deepaSong ? (
              <View style={s.list}>
                <Pressable onPress={() => open(deepaSong)} style={s.row}>
                  <View style={[s.cover, { backgroundColor: colors.greenSoft }]}>
                    <Icon name="musical-note" color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.title}>{deepaSong.title}</Text>
                    <Text style={s.meta}>{deepaSong.subtitle}</Text>
                  </View>
                  <Icon name="chevron-forward" color={colors.muted} size={18} />
                </Pressable>
              </View>
            ) : null}
            {isOpen && g.key === "channel" ? <YouTubeVideos /> : null}
          </View>
        );
      })}
      </>
      ) : (
      <>
      <View style={s.search}>
        <Icon name="search" color={colors.muted} size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search songs"
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          returnKeyType="search"
          style={s.searchInput}
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} hitSlop={10}>
            <Icon name="close-circle" color={colors.muted} size={18} />
          </Pressable>
        ) : null}
      </View>
      {q && totalFound === 0 ? (
        <Text style={[s.meta, { textAlign: "center", marginVertical: 18 }]}>
          No songs found for "{query.trim()}" in this language.
        </Text>
      ) : null}
      <View style={s.langTabs}>
        {SONG_TABS.map((x) => (
          <Pressable
            key={x.key}
            onPress={() => {
              setTab(x.key);
              void AsyncStorage.setItem("resourcesLang", x.key);
            }}
            style={[s.langTab, tab === x.key && s.langTabOn]}
          >
            <Text style={[s.langTabText, tab === x.key && s.langTabTextOn]}>
              {x.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {groups.filter((g) => !q || g.items.length + g.docs.length > 0).map((g) => {
        const isOpen = !!q || effectiveOpen === g.key;
        return (
          <View key={g.key} style={{ marginBottom: 10 }}>
            <Pressable
              onPress={() => setOpenKey(isOpen ? null : g.key)}
              style={s.groupHead}
            >
              <Text style={s.groupTitle}>{g.label}</Text>
              <Text style={s.type}>{g.items.length + new Set(g.docs.map(baseId)).size}</Text>
              <Icon name={isOpen ? "chevron-up" : "chevron-down"} color={colors.muted} size={18} />
            </Pressable>
            {isOpen ? (
              <View style={s.list}>
                {g.items.length + g.docs.length === 0 ? (
                  <Text style={[s.meta, { padding: 14 }]}>Coming soon</Text>
                ) : null}
                {g.items.map((song) => (
                  <Pressable key={song.id} onPress={() => open(song)} style={s.row}>
                    <View
                      style={[
                        s.cover,
                        { backgroundColor: song.type === "AUDIO" ? colors.greenSoft : "#FFF1DA" },
                      ]}
                    >
                      <Icon
                        name={song.type === "AUDIO" ? "musical-note" : "document-text"}
                        color={song.type === "AUDIO" ? colors.success : colors.saffron}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.title}>{song.title}</Text>
                      <Text style={s.meta}>
                        {SONG_TABS.find((x) => x.key === tab)?.label} + English
                      </Text>
                    </View>
                    <Icon name="chevron-forward" color={colors.muted} size={18} />
                  </Pressable>
                ))}
                {renderBooks(g.docs)}
              </View>
            ) : null}
          </View>
        );
      })}
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
  dl: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 8 },
  bookRow: {
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  pills: { flexDirection: "row", gap: 8, marginTop: 8 },
  pill: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pillOn: { backgroundColor: colors.goldFill, borderColor: colors.goldFill },
  pillText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  pillTextOn: { color: colors.ink },
  langTabs: { flexDirection: "row", gap: 8, marginBottom: 12 },
  langTab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  langTabOn: { backgroundColor: colors.goldFill, borderColor: colors.goldFill },
  langTabText: { color: colors.text, fontSize: 14, fontWeight: "800" },
  langTabTextOn: { color: colors.ink },
  groupHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 13,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 6,
  },
  groupTitle: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "900" },
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
