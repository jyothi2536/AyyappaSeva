import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { Icon } from "./UI";
import { colors } from "../theme";
import { subscribeToLive, type LiveState } from "../services/firebase";
import { liveEmbedUrl, liveWatchUrl } from "../services/youtube";

const embedHtml = (src: string) => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>html,body{margin:0;background:#000;height:100%}iframe{border:0;width:100%;height:100%}</style>
</head><body><iframe src="${src}"
allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></body></html>`;

/** Shown only while an admin has switched LIVE on. Updates instantly via Firestore. */
export default function LiveCard() {
  const [live, setLive] = useState<LiveState | null>(null);
  const [playing, setPlaying] = useState(false);
  // The YouTube embed is blocked for this channel's streams ("Video unavailable"),
  // while the regular watch page plays fine in the WebView, so use it by default.
  const [fallback, setFallback] = useState(true);
  const [full, setFull] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => subscribeToLive(setLive), []);

  useEffect(() => {
    if (!live) {
      setPlaying(false);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [live, pulse]);

  if (!live) return null;
  const title = live.title.replace(/^🔴\s*/, "") || "Live from Atlanta Ayyappa Temple";

  const player = (
    <WebView
            source={
              fallback
                ? { uri: liveWatchUrl(live.videoId).replace("www.youtube.com", "m.youtube.com") }
                : {
                    uri: liveEmbedUrl(live.videoId),
                    headers: { Referer: "https://ayyappaseva-fb811.web.app/" },
                  }
            }
            allowsInlineMediaPlayback
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            setSupportMultipleWindows={false}
            style={{ backgroundColor: "#000" }}
          />
  );

  return (
    <View style={s.card}>
      <Modal visible={full} animationType="fade" supportedOrientations={["portrait", "landscape"]} onRequestClose={() => setFull(false)}>
        <View style={s.full}>
          {full ? player : null}
          <Pressable accessibilityLabel="Close full screen" onPress={() => setFull(false)} style={s.close} hitSlop={10}>
            <Icon name="close" size={26} color="#fff" />
          </Pressable>
        </View>
      </Modal>
      <View style={s.head}>
        <View style={s.badge}>
          <Animated.View style={[s.dot, { opacity: pulse }]} />
          <Text style={s.badgeText}>LIVE NOW</Text>
        </View>
        <Pressable onPress={() => Linking.openURL(liveWatchUrl(live.videoId))} hitSlop={8}>
          <Icon name="logo-youtube" size={22} color="#E62117" />
        </Pressable>
      </View>
      {playing ? (
        <View style={s.player}>
          {full ? null : player}
          {full ? null : (
            <Pressable accessibilityLabel="Full screen" onPress={() => setFull(true)} style={s.expand} hitSlop={8}>
              <Icon name="expand" size={20} color="#fff" />
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable onPress={() => setPlaying(true)} style={s.player}>
          {live.videoId ? (
            <Image
              source={{ uri: `https://i.ytimg.com/vi/${live.videoId}/hqdefault.jpg` }}
              style={s.thumb}
            />
          ) : null}
          <View style={s.playOverlay}>
            <View style={s.playBtn}>
              <Icon name="play" size={26} color="#fff" />
            </View>
          </View>
        </Pressable>
      )}
      {playing && !fallback ? (
        <Pressable onPress={() => setFallback(true)} hitSlop={8}>
          <Text style={s.alt}>Video unavailable? Tap here to play in the app</Text>
        </Pressable>
      ) : null}
      <Text style={s.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={s.sub}>Watch the live darshan from Atlanta Ayyappa Temple</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3C6C3",
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E62117",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  player: { width: "100%", aspectRatio: 16 / 9, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  thumb: { width: "100%", height: "100%" },
  playOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(230,33,23,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: colors.text, fontSize: 14, fontWeight: "800", marginTop: 10 },
  expand: { position: "absolute", right: 8, bottom: 8, backgroundColor: "rgba(0,0,0,.6)", borderRadius: 8, padding: 6 },
  full: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  close: { position: "absolute", top: 50, right: 18, backgroundColor: "rgba(0,0,0,.6)", borderRadius: 20, padding: 6 },
  alt: { color: "#E62117", fontSize: 12, fontWeight: "800", marginTop: 8 },
  sub: { color: colors.muted, fontSize: 11, marginTop: 4 },
});
