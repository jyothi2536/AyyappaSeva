import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Icon } from "./UI";
import { colors } from "../theme";
import { setLive, subscribeToLive, type LiveState } from "../services/firebase";
import { sendLiveNotification } from "../services/livePush";
import { extractVideoId, fetchLiveStatus } from "../services/youtube";

/** Admin switch: GO LIVE shows the LIVE card in every app instantly; END LIVE hides it. */
export default function AdminLivePanel() {
  const [live, setLiveState] = useState<LiveState | null>(null);
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeToLive(setLiveState), []);

  const goLive = async () => {
    setBusy(true);
    try {
      let videoId: string | null = null;
      let title = "";
      if (link.trim()) {
        videoId = extractVideoId(link);
        if (!videoId) {
          Alert.alert("Invalid link", "Paste a YouTube video or live link, or leave it empty.");
          return;
        }
      } else {
        // One lookup (admin only) to find the stream that is live right now.
        const status = await fetchLiveStatus().catch(() => null);
        if (status?.state === "live") {
          videoId = status.video.id;
          title = status.video.title;
        }
      }
      await setLive({ active: true, videoId, title });
      void sendLiveNotification(title).catch(() => undefined);
      setLink("");
    } catch (reason) {
      Alert.alert("Unable to go live", reason instanceof Error ? reason.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const endLive = () =>
    Alert.alert("End live?", "The LIVE card will disappear for all users.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End live",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          try {
            await setLive({ active: false, videoId: null, title: "" });
          } catch (reason) {
            Alert.alert("Unable to end live", reason instanceof Error ? reason.message : "Please try again.");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);

  return (
    <View style={s.card}>
      <View style={s.row}>
        <View style={[s.status, live && s.statusLive]}>
          <View style={[s.dot, live && s.dotLive]} />
          <Text style={[s.statusText, live && { color: "#fff" }]}>{live ? "LIVE NOW" : "OFF AIR"}</Text>
        </View>
        {live ? (
          <Text style={s.meta} numberOfLines={1}>
            {live.title || (live.videoId ? `Video ${live.videoId}` : "Channel live stream")}
          </Text>
        ) : null}
      </View>
      {live ? (
        <Pressable onPress={endLive} disabled={busy} style={[s.btn, s.endBtn]}>
          {busy ? <ActivityIndicator color="#fff" /> : <Icon name="stop-circle" color="#fff" size={20} />}
          <Text style={s.btnText}>END LIVE</Text>
        </Pressable>
      ) : (
        <>
          <TextInput
            value={link}
            onChangeText={setLink}
            placeholder="YouTube live link (optional)"
            placeholderTextColor="#6F6A59"
            autoCapitalize="none"
            autoCorrect={false}
            style={s.input}
          />
          <Text style={s.hint}>
            Leave empty to use the stream that is live on the temple channel right now.
          </Text>
          <Pressable onPress={goLive} disabled={busy} style={[s.btn, s.goBtn]}>
            {busy ? <ActivityIndicator color="#fff" /> : <Icon name="radio" color="#fff" size={20} />}
            <Text style={s.btnText}>GO LIVE</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(212,166,90,0.35)",
    marginBottom: 12,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  statusLive: { backgroundColor: "#E62117" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#999" },
  dotLive: { backgroundColor: "#fff" },
  statusText: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  meta: { flex: 1, color: colors.muted, fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(212,166,90,0.35)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  hint: { color: colors.muted, fontSize: 11, marginTop: 6, marginBottom: 12 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 13,
  },
  goBtn: { backgroundColor: "#E62117" },
  endBtn: { backgroundColor: "#555" },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 1 },
});
