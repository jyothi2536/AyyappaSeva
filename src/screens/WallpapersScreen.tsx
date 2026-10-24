import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { saveWallpaperAsset } from "../services/wallpapers";
import { BackButton, Icon, Page, ScreenHeader } from "../components/UI";
import { useApp } from "../state/AppContext";
import type { RootStackParamList, Wallpaper } from "../types";
import { colors } from "../theme";

const GAP = 8;

export default function WallpapersScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Wallpapers">) {
  const { wallpapers, cloudConfigured } = useApp();
  const { width } = useWindowDimensions();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // 3 columns on phones, more on tablets and unfolded foldables.
  const columns = width >= 700 ? 5 : width >= 540 ? 4 : 3;
  const tile = (Math.min(width, 1000) - 32 - GAP * (columns - 1)) / columns;

  return (
    <Page>
      <BackButton navigation={navigation} />
      <ScreenHeader
        eyebrow="DIVINE COLLECTION"
        title="Wallpapers"
        subtitle="Tap a photo to view it full screen and download it to your phone."
      />
      {wallpapers.length === 0 ? (
        <View style={s.empty}>
          <Icon name="images-outline" size={34} color={colors.gold} />
          <Text style={s.emptyText}>
            {cloudConfigured
              ? "No wallpapers yet. New photos will appear here as soon as they are added."
              : "Wallpapers are not available right now."}
          </Text>
        </View>
      ) : (
        <View style={[s.grid, { gap: GAP }]}>
          {wallpapers.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityRole="imagebutton"
              accessibilityLabel={`Wallpaper ${index + 1} of ${wallpapers.length}`}
              onPress={() => setOpenIndex(index)}
              style={({ pressed }) => [
                s.tile,
                { width: tile, height: tile * 1.6 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Image source={{ uri: item.thumbUrl }} style={s.fill} />
            </Pressable>
          ))}
        </View>
      )}
      <WallpaperViewer
        wallpapers={wallpapers}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
      />
    </Page>
  );
}

function WallpaperViewer({
  wallpapers,
  index,
  onClose,
}: {
  wallpapers: Wallpaper[];
  index: number | null;
  onClose: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);
  const visible = index !== null;
  const active = wallpapers[current];

  useEffect(() => {
    if (index !== null) setCurrent(index);
  }, [index]);

  const download = async () => {
    if (!active || saving) return;
    setSaving(true);
    try {
      await saveWallpaperAsset(active.url);
      Alert.alert("Saved to your photos", "Set it as your wallpaper from the Photos app.");
    } catch (reason) {
      Alert.alert(
        "Unable to save wallpaper",
        reason instanceof Error ? reason.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={s.viewer}>
        {visible ? (
          <FlatList
            data={wallpapers}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={index}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(event) =>
              setCurrent(Math.round(event.nativeEvent.contentOffset.x / width))
            }
            renderItem={({ item }) => (
              <View style={{ width, height }}>
                <Image source={{ uri: item.thumbUrl }} style={s.fill} blurRadius={2} />
                <Image source={{ uri: item.url }} style={[s.fill, s.full]} />
              </View>
            )}
          />
        ) : null}
        <View style={[s.topBar, { top: insets.top + 8 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            hitSlop={10}
            style={s.round}
          >
            <Icon name="close" color="#fff" />
          </Pressable>
          <Text style={s.counter}>
            {current + 1} / {wallpapers.length}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Download wallpaper"
          onPress={download}
          disabled={saving}
          style={({ pressed }) => [
            s.download,
            { bottom: insets.bottom + 20 },
            (pressed || saving) && { opacity: 0.75 },
          ]}
        >
          {saving ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <Icon name="download" color={colors.ink} />
          )}
          <Text style={s.downloadText}>{saving ? "Saving…" : "Download"}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap" },
  tile: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  fill: { width: "100%", height: "100%", resizeMode: "cover" },
  full: { position: "absolute" },
  empty: { alignItems: "center", gap: 10, paddingVertical: 48 },
  emptyText: { color: colors.muted, textAlign: "center", fontSize: 14 },
  viewer: { flex: 1, backgroundColor: "#000" },
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  round: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,.55)",
  },
  counter: {
    color: "#fff",
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,.55)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: "hidden",
  },
  download: {
    position: "absolute",
    alignSelf: "center",
    height: 52,
    paddingHorizontal: 28,
    borderRadius: 26,
    backgroundColor: colors.goldFill,
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadText: { color: colors.ink, fontSize: 15, fontWeight: "900" },
});
