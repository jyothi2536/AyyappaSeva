import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton, GoldButton, Icon, Page, ScreenHeader } from "../components/UI";
import { useApp } from "../state/AppContext";
import { addWallpaper, removeWallpaper } from "../services/firebase";
import { pickWallpaperPhotos, prepareWallpaper } from "../services/wallpaperUpload";
import type { RootStackParamList, Wallpaper } from "../types";
import { colors } from "../theme";

const GAP = 8;

export default function AdminWallpapersScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "AdminWallpapers">) {
  const { wallpapers, isAdmin } = useApp();
  const { width } = useWindowDimensions();
  const [progress, setProgress] = useState<string | null>(null);
  const columns = width >= 540 ? 4 : 3;
  const tile = (Math.min(width, 1000) - 32 - GAP * (columns - 1)) / columns;

  const upload = async () => {
    if (progress) return;
    let assets;
    try {
      assets = await pickWallpaperPhotos();
    } catch (reason) {
      Alert.alert("Unable to open photos", reason instanceof Error ? reason.message : "Please try again.");
      return;
    }
    if (!assets.length) return;
    let added = 0;
    const skipped: string[] = [];
    for (const [i, asset] of assets.entries()) {
      setProgress(`Uploading ${i + 1} of ${assets.length}…`);
      try {
        const prepared = await prepareWallpaper(asset);
        if ("rejected" in prepared) {
          skipped.push(`Photo ${i + 1}: ${prepared.rejected}`);
          continue;
        }
        await addWallpaper(prepared);
        added += 1;
      } catch (reason) {
        skipped.push(`Photo ${i + 1}: ${reason instanceof Error ? reason.message : "Upload failed."}`);
      }
    }
    setProgress(null);
    Alert.alert(
      added ? `${added} wallpaper${added === 1 ? "" : "s"} added` : "No wallpapers added",
      skipped.length ? `Skipped:\n${skipped.join("\n")}` : "They now appear in Wallpapers for everyone.",
    );
  };

  const confirmDelete = (item: Wallpaper) => {
    Alert.alert("Delete this wallpaper?", "It will be removed from the app for everyone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void removeWallpaper(item).catch((reason) =>
            Alert.alert("Unable to delete", reason instanceof Error ? reason.message : "Please try again."),
          );
        },
      },
    ]);
  };

  return (
    <Page>
      <BackButton navigation={navigation} />
      <ScreenHeader
        eyebrow="ADMIN"
        title="Manage wallpapers"
        subtitle="Upload upright photos at least 1080px wide. They are resized automatically and appear in Wallpapers for everyone."
      />
      {!isAdmin ? (
        <Text style={s.note}>Sign in as an administrator to manage wallpapers.</Text>
      ) : (
        <>
          {progress ? (
            <View style={s.progress}>
              <ActivityIndicator color={colors.gold} />
              <Text style={s.progressText}>{progress}</Text>
            </View>
          ) : (
            <GoldButton label="Upload photos" icon="cloud-upload" onPress={upload} />
          )}
          <Text style={s.count}>
            {wallpapers.length} wallpaper{wallpapers.length === 1 ? "" : "s"} · tap the bin to delete
          </Text>
          <View style={[s.grid, { gap: GAP }]}>
            {wallpapers.map((item) => (
              <View key={item.id} style={[s.tile, { width: tile, height: tile * 1.6 }]}>
                <Image source={{ uri: item.thumbUrl }} style={s.fill} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Delete wallpaper"
                  hitSlop={8}
                  onPress={() => confirmDelete(item)}
                  style={s.delete}
                >
                  <Icon name="trash-outline" size={18} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}
    </Page>
  );
}

const s = StyleSheet.create({
  note: { color: colors.muted, textAlign: "center", marginTop: 24 },
  progress: {
    height: 54,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: { color: colors.text, fontWeight: "800" },
  count: { color: colors.muted, fontSize: 12, marginVertical: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  tile: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  fill: { width: "100%", height: "100%", resizeMode: "cover" },
  delete: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(150,30,20,.85)",
  },
});
