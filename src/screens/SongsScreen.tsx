import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon, Page, ScreenHeader } from "../components/UI";
import { builtInDocuments, scriptureFeatureCopy } from "../data/content";
import { useApp } from "../state/AppContext";
import type { RootStackParamList, Song } from "../types";
import { colors } from "../theme";

export default function SongsScreen() {
  const { t, songs, language } = useApp();
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
  return (
    <Page>
      <ScreenHeader
        eyebrow={t.listen}
        title={t.library}
        subtitle={t.librarySub}
      />
      <Pressable
        style={s.feature}
        onPress={() => navigation.navigate("Scriptures")}
      >
        <LinearGradient
          colors={["#31452F", "#172219"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.featureIcon}>
          <Icon name="headset" color="#DCEFD9" size={27} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.badge}>{scripture.badge}</Text>
          <Text style={s.featureTitle}>{scripture.title}</Text>
          <Text style={s.featureSub}>{scripture.subtitle}</Text>
        </View>
        <Icon name="chevron-forward" color="#A7D0A6" />
      </Pressable>
      <Pressable
        style={s.download}
        onPress={() => navigation.navigate("Downloads")}
      >
        <View style={s.downloadIcon}>
          <Icon name="download-outline" color={colors.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.featureTitle}>{t.downloads}</Text>
          <Text style={s.meta}>
            {builtInDocuments.length} · {t.availableOffline}
          </Text>
        </View>
        <Icon name="chevron-forward" color={colors.gold} />
      </Pressable>
      <Text style={s.label}>DEVOTIONAL COLLECTION</Text>
      <View style={s.list}>
        {songs.map((song) => (
          <Pressable key={song.id} onPress={() => open(song)} style={s.row}>
            <View
              style={[
                s.cover,
                {
                  backgroundColor:
                    song.type === "AUDIO" ? "#243B26" : "#3B2B14",
                },
              ]}
            >
              <Icon
                name={song.type === "AUDIO" ? "musical-note" : "document-text"}
                color={song.type === "AUDIO" ? "#A8D1A6" : colors.gold}
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
      <View style={s.info}>
        <Icon name="shield-checkmark-outline" color="#87AE89" />
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
    borderColor: "rgba(135,174,137,.28)",
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
    backgroundColor: "rgba(167,208,166,.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: { color: "#A7D0A6", fontSize: 8, letterSpacing: 1, fontWeight: "900" },
  featureTitle: {
    color: colors.cream,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  featureSub: { color: "#9CAF9A", fontSize: 10, marginTop: 5 },
  download: {
    minHeight: 82,
    borderRadius: 20,
    backgroundColor: "#2C2110",
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
    backgroundColor: colors.gold,
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
  title: { color: colors.cream, fontSize: 14, fontWeight: "800" },
  type: { fontSize: 8, color: colors.gold, fontWeight: "900" },
  info: {
    marginTop: 15,
    padding: 13,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(72,99,70,.18)",
    borderRadius: 14,
  },
  infoText: { color: "#9FAF9E", fontSize: 11, lineHeight: 16, flex: 1 },
});
