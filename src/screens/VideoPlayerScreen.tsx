import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import { BackButton } from "../components/UI";
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
  const { title, url } = route.params;
  const [loading, setLoading] = useState(true);
  return (
    <View style={s.root}>
      <View style={s.header}>
        <BackButton navigation={navigation} />
        <Text style={s.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={s.web}>
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
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});
