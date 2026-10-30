import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getAyyappa108 } from "../../Ayyappa108Lyrics";
import { getAyyappaAshtottara } from "../../AyyappaAshtottaraLyrics";
import { getAyyappaDeepaaradhana } from "../../AyyappaDeepaaradhanaLyrics";
import { getDurgaAshtottara } from "../../DurgaAshtottaraLyrics";
import { getGaneshaAshtottara } from "../../GaneshaAshtottaraLyrics";
import { getSubrahmanyaAshtottara } from "../../SubrahmanyaAshtottaraLyrics";
import { BackButton, Icon } from "../components/UI";
import { LyricsLanguagePicker } from "../components/LyricsLanguagePicker";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

export default function LyricsScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "Lyrics">) {
  const { lyricsLanguage: language, t } = useApp();
  const is108 =
    route.params.kind === "saranams108" ||
    route.params.kind === "ashtottara" ||
    route.params.kind === "durgaAshtottara" ||
    route.params.kind === "ganeshaAshtottara" ||
    route.params.kind === "subrahmanyaAshtottara";
  const content = useMemo(
    () =>
      route.params.kind === "ashtottara"
        ? getAyyappaAshtottara(language)
        : route.params.kind === "durgaAshtottara"
          ? getDurgaAshtottara(language)
          : route.params.kind === "ganeshaAshtottara"
            ? getGaneshaAshtottara(language)
            : route.params.kind === "subrahmanyaAshtottara"
              ? getSubrahmanyaAshtottara(language)
              : route.params.kind === "saranams108"
                ? getAyyappa108(language)
                : getAyyappaDeepaaradhana(language),
    [route.params.kind, language],
  );
  return (
    <View style={s.root}>
      <View style={s.header}>
        <BackButton navigation={navigation} label={t.library} />
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{content.title}</Text>
          <Text style={s.meta}>{content.subtitle}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <LyricsLanguagePicker />
        <View style={[s.badge, { marginTop: 14 }]}>
          <Icon name="cloud-done" size={18} color="#A7D0A6" />
          <Text style={s.badgeText}>{content.offline}</Text>
        </View>
        <Text style={s.heading}>{content.title}</Text>
        <Text style={s.intro}>
          {is108
            ? (content as ReturnType<typeof getAyyappa108>).intro
            : content.subtitle}
        </Text>
        <Text style={s.source}>{content.source}</Text>
        <View style={s.rule} />
        {is108 ? (
          (content as ReturnType<typeof getAyyappa108>).lines.map(
            (line, index) => (
              <View key={index} style={s.line}>
                <Text selectable style={s.text}>
                  {line}
                </Text>
              </View>
            ),
          )
        ) : (
          <>
            {(
              content as ReturnType<typeof getAyyappaDeepaaradhana>
            ).stanzas.map((stanza, index) => (
              <View key={index} style={s.stanza}>
                {stanza.map((line, i) => (
                  <Text selectable key={i} style={s.text}>
                    {line}
                  </Text>
                ))}
              </View>
            ))}
            <View style={s.ending}>
              <Text selectable style={s.endingText}>
                {(content as ReturnType<typeof getAyyappaDeepaaradhana>).ending}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 92,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 9, marginTop: 4 },
  content: { padding: 21, paddingBottom: 60 },
  badge: {
    alignSelf: "flex-start",
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: 12,
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    backgroundColor: "rgba(72,99,70,.25)",
  },
  badgeText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 21,
  },
  intro: { color: colors.gold, fontSize: 16, fontWeight: "800", marginTop: 12 },
  source: { color: colors.muted, fontSize: 10, marginTop: 6 },
  rule: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.goldFill,
    marginTop: 16,
    marginBottom: 19,
  },
  line: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  stanza: {
    paddingBottom: 20,
    marginBottom: 19,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  text: {
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 16,
    lineHeight: 27,
  },
  ending: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(233,185,73,.1)",
    borderWidth: 1,
    borderColor: "rgba(233,185,73,.24)",
  },
  endingText: { color: colors.gold, fontSize: 17, fontWeight: "900" },
});
