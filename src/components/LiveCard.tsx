import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
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

  return (
    <View style={s.card}>
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
          <WebView
            source={{
              html: embedHtml(liveEmbedUrl(live.videoId)),
              baseUrl: "https://ayyappaseva-fb811.web.app",
            }}
            allowsInlineMediaPlayback
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            style={{ backgroundColor: "#000" }}
          />
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
  sub: { color: colors.muted, fontSize: 11, marginTop: 4 },
});
