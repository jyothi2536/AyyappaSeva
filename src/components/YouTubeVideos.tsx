import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "./UI";
import { colors } from "../theme";
import {
  fetchChannelVideos,
  fetchUploadsPage,
  loadCachedVideos,
  youtubeApiConfigured,
  YOUTUBE_CHANNEL_URL,
  type YouTubeVideo,
} from "../services/youtube";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export default function YouTubeVideos() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let alive = true;
    loadCachedVideos().then((cached) => {
      if (alive && cached.length) setVideos(cached);
    });
    const load = youtubeApiConfigured
      ? fetchUploadsPage().then((page) => {
          if (alive) setNextPage(page.nextPageToken);
          return page.videos;
        })
      : fetchChannelVideos();
    load
      .then((fresh) => alive && fresh.length && setVideos(fresh))
      .catch(() => undefined)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const loadMore = async () => {
    if (!nextPage || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchUploadsPage(nextPage);
      setVideos((prev) => {
        const seen = new Set(prev.map((v) => v.id));
        return [...prev, ...page.videos.filter((v) => !seen.has(v.id))];
      });
      setNextPage(page.nextPageToken);
    } catch {
      // keep current list; user can retry
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <View>
      <View style={s.headerRow}>
        <Text style={s.label}>TEMPLE YOUTUBE</Text>
        <Pressable onPress={() => Linking.openURL(YOUTUBE_CHANNEL_URL)} hitSlop={8}>
          <Text style={s.link}>View channel ›</Text>
        </Pressable>
      </View>
      {loading && !videos.length ? (
        <ActivityIndicator color={colors.gold} style={{ marginVertical: 18 }} />
      ) : !videos.length ? (
        <Text style={s.empty}>Videos could not be loaded. Check your connection.</Text>
      ) : (
        <View style={s.list}>
          {videos.map((v) => (
            <Pressable key={v.id} onPress={() => Linking.openURL(v.url)} style={s.row}>
              <View>
                <Image source={{ uri: v.thumbnail }} style={s.thumb} />
                <View style={s.play}>
                  <Icon name="play" color="#fff" size={14} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title} numberOfLines={2}>
                  {v.title}
                </Text>
                <Text style={s.meta}>{formatDate(v.published)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
      {nextPage ? (
        <Pressable onPress={loadMore} style={s.moreBtn} disabled={loadingMore}>
          {loadingMore ? (
            <ActivityIndicator color={colors.gold} />
          ) : (
            <Text style={s.moreText}>LOAD MORE VIDEOS</Text>
          )}
        </Pressable>
      ) : null}
      <Pressable onPress={() => Linking.openURL(YOUTUBE_CHANNEL_URL)} style={s.allBtn}>
        <Icon name="logo-youtube" color="#E62117" size={20} />
        <Text style={s.allText}>SEE ALL VIDEOS ON YOUTUBE</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 10,
  },
  label: { color: colors.gold, fontSize: 11, letterSpacing: 1.5, fontWeight: "900" },
  link: { color: colors.saffron, fontSize: 12, fontWeight: "700" },
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: "#F1E4CC",
  },
  thumb: { width: 120, height: 68, borderRadius: 10, backgroundColor: "#EEE" },
  play: {
    position: "absolute",
    right: 6,
    bottom: 6,
    backgroundColor: "rgba(230,33,23,0.9)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  title: { color: colors.text, fontSize: 13, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  empty: { color: colors.muted, fontSize: 12, marginVertical: 12 },
  moreBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold,
  },
  moreText: { color: colors.gold, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  allBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3C6C3",
    backgroundColor: "#FFF5F4",
  },
  allText: { color: "#B3261E", fontSize: 12, fontWeight: "900", letterSpacing: 1 },
});
