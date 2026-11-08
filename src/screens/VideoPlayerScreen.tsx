import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import Pdf from "react-native-pdf-jsi";
import { BackButton } from "../components/UI";
import { LyricsLanguagePicker } from "../components/LyricsLanguagePicker";
import { prepareBuiltInDocument } from "../services/documents";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

/** Plays a YouTube watch page inside the app. */
/** Keep only the player: hide the info, comments, related videos, search and app banners. */
const HIDE_RELATED_JS = `
(function () {
  var css = 'ytm-single-column-watch-next-results-renderer > *:not(ytm-slim-video-metadata-section-renderer):not(.player-container){display:none!important}' +
    'ytm-item-section-renderer,ytm-watch-next-secondary-results-renderer,ytm-related-chip-cloud-renderer,ytm-comments-entry-point-header-renderer,ytm-slim-video-metadata-section-renderer,ytm-slim-owner-renderer,ytm-mobile-topbar-renderer,ytm-pivot-bar-renderer,ytm-companion-slot,ytm-promoted-sparkles-web-renderer,.mobile-topbar-header,.related-items-container,.watch-below-the-player{display:none!important}' +
    'body{background:#000!important}';
  function apply() {
    if (document.getElementById('hide-related')) return;
    var st = document.createElement('style');
    st.id = 'hide-related';
    st.innerHTML = css;
    (document.head || document.documentElement).appendChild(st);
  }
  apply();
  document.addEventListener('DOMContentLoaded', apply);
  setInterval(apply, 1000);
})();
true;
`;

export default function VideoPlayerScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "VideoPlayer">) {
  const { title, url, lyricsDocument, lyricsText } = route.params;
  const { lyricsLanguage } = useApp();
  const hasLyrics = Boolean(lyricsDocument || lyricsText);
  const [loading, setLoading] = useState(true);
  const [lyricsUri, setLyricsUri] = useState<string | null>(null);
  const [lyricsError, setLyricsError] = useState("");
  const { width, height } = useWindowDimensions();
  // With lyrics: the video keeps a 16:9 strip on top and the lyrics fill the rest.
  const videoHeight = Math.min(Math.round((width * 9) / 16) + 16, Math.round(height * 0.4));
  useEffect(() => {
    if (!lyricsDocument) return;
    let alive = true;
    prepareBuiltInDocument(lyricsDocument)
      .then((uri) => alive && setLyricsUri(uri))
      .catch((e) => alive && setLyricsError(e instanceof Error ? e.message : "Unable to load the lyrics."));
    return () => {
      alive = false;
    };
  }, [lyricsDocument]);
  return (
    <View style={s.root}>
      <View style={s.header}>
        <BackButton navigation={navigation} />
        <Text style={s.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={hasLyrics ? [s.web, { flex: 0, height: videoHeight }] : s.web}>
        {loading && (
          <View style={s.loading}>
            <ActivityIndicator size="large" color={colors.gold} />
          </View>
        )}
        <WebView
          source={{ uri: url.replace("www.youtube.com", "m.youtube.com") }}
          originWhitelist={["https://*"]}
          injectedJavaScript={HIDE_RELATED_JS}
          injectedJavaScriptBeforeContentLoaded={HIDE_RELATED_JS}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          thirdPartyCookiesEnabled
          setSupportMultipleWindows={false}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
      </View>
      {lyricsText ? (
        <View style={s.lyrics}>
          <View style={s.pickerRow}>
            <LyricsLanguagePicker only={(Object.keys(lyricsText) as (keyof typeof lyricsText)[])} />
          </View>
          <ScrollView contentContainerStyle={s.lyricsBody}>
            <Text selectable style={s.lyricsText}>
              {lyricsText[lyricsLanguage] ?? lyricsText.en ?? ""}
            </Text>
          </ScrollView>
        </View>
      ) : lyricsDocument ? (
        <View style={s.lyrics}>
          <Text style={s.lyricsLabel}>LYRICS</Text>
          {lyricsUri ? (
            <Pdf
              source={{ uri: lyricsUri, cache: false }}
              style={s.pdf}
              onError={(reason) => setLyricsError(String(reason))}
            />
          ) : lyricsError ? (
            <Text style={s.lyricsError}>{lyricsError}</Text>
          ) : (
            <ActivityIndicator color={colors.gold} style={{ marginTop: 24 }} />
          )}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: { flex: 1, color: colors.maroon, fontSize: 18, fontWeight: "700" },
  web: { flex: 1, backgroundColor: "#000" },
  lyrics: { flex: 1, backgroundColor: colors.background },
  lyricsLabel: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "900",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  pdf: { flex: 1, backgroundColor: colors.background },
  pickerRow: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  lyricsBody: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 60 },
  lyricsText: {
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 17,
    lineHeight: 29,
  },
  lyricsError: { color: colors.muted, fontSize: 12, padding: 16 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});
