import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import {
  harivarasanamLyrics,
  harivarasanamUi,
} from "../../HarivarasanamLyrics";
import { BackButton, Icon } from "../components/UI";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

export default function HarivarasanamScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Harivarasanam">) {
  const { language, t } = useApp();
  const [view, setView] = useState<"video" | "lyrics">("video");
  const [loading, setLoading] = useState(true);
  const ui = harivarasanamUi[language];
  return (
    <View style={s.root}>
      <View style={s.header}>
        <BackButton navigation={navigation} label={t.library} />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Harivarasanam</Text>
          <Text style={s.meta}>K. J. Yesudas · YouTube Music</Text>
        </View>
      </View>
      <View style={s.tabs}>
        <Tab
          label={ui.video}
          icon="play-circle-outline"
          active={view === "video"}
          onPress={() => setView("video")}
        />
        <Tab
          label={ui.lyrics}
          icon="document-text-outline"
          active={view === "lyrics"}
          onPress={() => setView("lyrics")}
        />
      </View>
      {view === "video" ? (
        <>
          <View style={s.web}>
            {loading && (
              <View style={s.loading}>
                <ActivityIndicator size="large" color={colors.gold} />
                <Text style={s.meta}>Loading YouTube Music…</Text>
              </View>
            )}
            <WebView
              source={{
                uri: "https://music.youtube.com/search?q=harivarasanam+yesudas+original",
              }}
              originWhitelist={["https://*"]}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction
              thirdPartyCookiesEnabled
              setSupportMultipleWindows={false}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          </View>
          <View style={s.notice}>
            <Icon name="wifi-outline" color="#A7D0A6" />
            <Text style={s.noticeText}>
              YouTube Music streams inside Ayyappa Seva. Internet connection
              required.
            </Text>
          </View>
        </>
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.badge}>
            <Icon name="cloud-done" color="#A7D0A6" />
            <Text style={s.badgeText}>{ui.offline}</Text>
          </View>
          <Text style={s.heading}>Harivarasanam</Text>
          <Text style={s.meta}>{ui.source}</Text>
          <View style={s.rule} />
          <Text selectable style={s.lyrics}>
            {harivarasanamLyrics[language]}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}
function Tab({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.tab, active && s.tabActive]}>
      <Icon name={icon} color={active ? colors.ink : colors.gold} />
      <Text style={[s.tabText, active && { color: colors.ink }]}>{label}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
    paddingTop: Platform.OS === "android" ? 38 : 0,
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
  title: { color: colors.cream, fontSize: 16, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 10, marginTop: 5 },
  tabs: {
    flexDirection: "row",
    gap: 9,
    padding: 11,
    backgroundColor: "#0E0E0A",
  },
  tab: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(233,185,73,.3)",
  },
  tabActive: { backgroundColor: colors.gold },
  tabText: { color: colors.gold, fontSize: 12, fontWeight: "900" },
  web: { flex: 1, backgroundColor: "#000" },
  loading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
  notice: {
    margin: 13,
    padding: 13,
    borderRadius: 18,
    flexDirection: "row",
    gap: 11,
    backgroundColor: "rgba(72,99,70,.18)",
  },
  noticeText: { color: "#9FAF9E", fontSize: 10, lineHeight: 16, flex: 1 },
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
  badgeText: { color: "#A7D0A6", fontSize: 10, fontWeight: "800" },
  heading: {
    color: colors.cream,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 21,
  },
  rule: {
    width: 40,
    height: 3,
    backgroundColor: colors.gold,
    marginVertical: 18,
  },
  lyrics: {
    color: "#F5E3B8",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 17,
    lineHeight: 29,
  },
});
