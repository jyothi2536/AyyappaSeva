import AsyncStorage from "@react-native-async-storage/async-storage";

export const YOUTUBE_CHANNEL_ID = "UCI7ePmBqRaATNfoCSa7jJ_w";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@AtlantaAyyappaTemple";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
const CACHE_KEY = "youtubeVideos";

export type YouTubeVideo = {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  url: string;
};

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

export function parseYouTubeFeed(xml: string): YouTubeVideo[] {
  const entries = xml.split("<entry>").slice(1);
  const videos: YouTubeVideo[] = [];
  for (const entry of entries) {
    const id = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(entry)?.[1];
    const title = /<title>([^<]*)<\/title>/.exec(entry)?.[1];
    if (!id || !title) continue;
    videos.push({
      id,
      title: decode(title),
      published: /<published>([^<]+)<\/published>/.exec(entry)?.[1] ?? "",
      thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${id}`,
    });
  }
  return videos;
}

export async function loadCachedVideos(): Promise<YouTubeVideo[]> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as YouTubeVideo[]) : [];
  } catch {
    return [];
  }
}

export async function fetchChannelVideos(): Promise<YouTubeVideo[]> {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`YouTube feed ${res.status}`);
  const videos = parseYouTubeFeed(await res.text());
  if (videos.length) await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(videos));
  return videos;
}

const API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;

export type LiveStatus = {
  state: "live" | "upcoming";
  video: YouTubeVideo;
  scheduledStart?: string;
};

type VideosResponse = {
  items?: {
    id?: string;
    snippet?: { title?: string; liveBroadcastContent?: string };
    liveStreamingDetails?: { scheduledStartTime?: string; actualStartTime?: string };
  }[];
};

/** Live-now stream, else the next scheduled one, else null. ~1 API unit. */
export async function fetchLiveStatus(): Promise<LiveStatus | null> {
  if (!API_KEY) return null;
  const recent = await fetchChannelVideos();
  if (!recent.length) return null;
  const params = new URLSearchParams({
    part: "snippet,liveStreamingDetails",
    id: recent.map((v) => v.id).join(","),
    key: API_KEY,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);
  const json = (await res.json()) as VideosResponse;
  const byId = new Map(recent.map((v) => [v.id, v]));
  const items = json.items ?? [];
  const live = items.find((i) => i.snippet?.liveBroadcastContent === "live");
  if (live?.id && byId.get(live.id)) return { state: "live", video: byId.get(live.id)! };
  const upcoming = items
    .filter((i) => i.snippet?.liveBroadcastContent === "upcoming" && i.liveStreamingDetails?.scheduledStartTime)
    .filter((i) => Date.parse(i.liveStreamingDetails!.scheduledStartTime!) > Date.now() - 3600_000)
    .sort((a, b) =>
      a.liveStreamingDetails!.scheduledStartTime!.localeCompare(b.liveStreamingDetails!.scheduledStartTime!),
    )[0];
  if (upcoming?.id && byId.get(upcoming.id))
    return {
      state: "upcoming",
      video: byId.get(upcoming.id)!,
      scheduledStart: upcoming.liveStreamingDetails?.scheduledStartTime,
    };
  return null;
}

/** Pull an 11-char video ID out of any YouTube link (watch, youtu.be, live/, shorts/). */
export function extractVideoId(input: string): string | null {
  const text = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(text)) return text;
  const m = /(?:v=|youtu\.be\/|\/live\/|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{11})/.exec(text);
  return m?.[1] ?? null;
}

export const liveEmbedUrl = (videoId: string | null) =>
  videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`
    : `https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}&autoplay=1&playsinline=1`;

export const liveWatchUrl = (videoId: string | null) =>
  videoId ? `https://www.youtube.com/watch?v=${videoId}` : `${YOUTUBE_CHANNEL_URL}/live`;
// Every channel's "uploads" playlist is its channel ID with UC -> UU.
const UPLOADS_PLAYLIST = `UU${YOUTUBE_CHANNEL_ID.slice(2)}`;
export const youtubeApiConfigured = Boolean(API_KEY);

type PlaylistItemsResponse = {
  nextPageToken?: string;
  items?: {
    snippet?: {
      title?: string;
      publishedAt?: string;
      resourceId?: { videoId?: string };
      thumbnails?: { medium?: { url?: string } };
    };
    contentDetails?: { videoPublishedAt?: string };
  }[];
};

export function parsePlaylistItems(json: PlaylistItemsResponse): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];
  for (const item of json.items ?? []) {
    const id = item.snippet?.resourceId?.videoId;
    const title = item.snippet?.title;
    if (!id || !title || title === "Private video" || title === "Deleted video") continue;
    videos.push({
      id,
      title,
      published: item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt ?? "",
      thumbnail: item.snippet?.thumbnails?.medium?.url ?? `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${id}`,
    });
  }
  return videos;
}

/** Fetch one page (50 videos) of the full channel uploads. Requires an API key. */
export async function fetchUploadsPage(
  pageToken?: string,
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    maxResults: "50",
    playlistId: UPLOADS_PLAYLIST,
    key: API_KEY ?? "",
  });
  if (pageToken) params.set("pageToken", pageToken);
  const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);
  const json = (await res.json()) as PlaylistItemsResponse;
  const videos = parsePlaylistItems(json);
  if (!pageToken && videos.length) await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(videos));
  return { videos, nextPageToken: json.nextPageToken };
}
