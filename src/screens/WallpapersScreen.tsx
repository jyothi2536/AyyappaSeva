import React, { useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { saveWallpaperAsset } from "../services/wallpapers";
import { BackButton, Icon, Page, ScreenHeader } from "../components/UI";
import { wallpapers } from "../data/content";
import type { RootStackParamList, Wallpaper } from "../types";
import { colors } from "../theme";

const ITEM_SPACING = 12;

export default function WallpapersScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Wallpapers">) {
  const { width } = useWindowDimensions();
  const carouselRef = useRef<FlatList<Wallpaper>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = Math.max(280, Math.min(width - 56, 460));
  const cardHeight = cardWidth * 1.55;
  const snapInterval = cardWidth + ITEM_SPACING;
  const sideInset = Math.max(0, (width - cardWidth) / 2);
  const activeWallpaper = wallpapers[activeIndex] ?? wallpapers[0];
  const atStart = activeIndex === 0;
  const atEnd = activeIndex === wallpapers.length - 1;

  const goToIndex = (nextIndex: number) => {
    const bounded = Math.max(0, Math.min(wallpapers.length - 1, nextIndex));
    setActiveIndex(bounded);
    carouselRef.current?.scrollToOffset({
      offset: bounded * snapInterval,
      animated: true,
    });
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    const bounded = Math.max(0, Math.min(wallpapers.length - 1, next));
    setActiveIndex(bounded);
  };

  const save = async () => {
    if (!activeWallpaper) return;
    try {
      await saveWallpaperAsset(activeWallpaper.source);
      Alert.alert("Wallpaper saved");
    } catch (reason) {
      Alert.alert(
        "Unable to save wallpaper",
        reason instanceof Error ? reason.message : "Please try again.",
      );
    }
  };
  return (
    <Page>
      <BackButton navigation={navigation} />
      <ScreenHeader
        eyebrow="DIVINE COLLECTION"
        title="Idol wallpaper carousel"
        subtitle="Swipe to preview divine artwork and save your favorite to your phone."
      />
      <View style={s.carouselSection}>
        <FlatList
          ref={carouselRef}
          data={wallpapers}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={snapInterval}
          decelerationRate="fast"
          bounces={false}
          onMomentumScrollEnd={onScrollEnd}
          contentContainerStyle={{ paddingHorizontal: sideInset }}
          renderItem={({ item }) => (
            <View style={[s.card, { width: cardWidth, height: cardHeight }]}>
              <Image source={item.source} style={s.image} />
              <LinearGradient
                colors={["rgba(0,0,0,.08)", "rgba(0,0,0,.2)", "rgba(0,0,0,.72)"]}
                style={s.shade}
              />
              <View style={s.copy}>
                <Text style={s.title}>{item.name}</Text>
                <Text style={s.meta}>{item.subtitle}</Text>
              </View>
            </View>
          )}
        />
        <View style={s.arrowRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous wallpaper"
            disabled={atStart}
            onPress={() => goToIndex(activeIndex - 1)}
            style={[s.arrow, atStart && s.arrowDisabled]}
          >
            <Icon
              name="chevron-back"
              size={24}
              color={atStart ? "#8E8776" : colors.cream}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next wallpaper"
            disabled={atEnd}
            onPress={() => goToIndex(activeIndex + 1)}
            style={[s.arrow, atEnd && s.arrowDisabled]}
          >
            <Icon
              name="chevron-forward"
              size={24}
              color={atEnd ? "#8E8776" : colors.cream}
            />
          </Pressable>
        </View>
        <Text style={s.swipeHint}>Swipe or use arrows</Text>
        <View style={s.dots}>
          {wallpapers.map((item, index) => (
            <View
              key={item.id}
              style={[
                s.dot,
                index === activeIndex && [s.dotActive, { backgroundColor: item.accent }],
              ]}
            />
          ))}
        </View>
        <View style={s.details}>
          <Text style={s.previewTitle}>{activeWallpaper.name}</Text>
          <Text style={s.previewMeta}>{activeWallpaper.subtitle}</Text>
        </View>
        <Pressable style={s.save} onPress={save}>
          <Icon name="download" color={colors.ink} />
          <Text style={s.saveText}>Save wallpaper</Text>
        </Pressable>
      </View>
    </Page>
  );
}
const s = StyleSheet.create({
  carouselSection: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "rgba(233,185,73,.05)",
    paddingTop: 12,
    paddingBottom: 14,
  },
  card: {
    marginRight: ITEM_SPACING,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  shade: {
    ...StyleSheet.absoluteFillObject,
  },
  copy: { position: "absolute", left: 13, right: 12, bottom: 14 },
  title: { color: colors.cream, fontSize: 14, fontWeight: "800" },
  meta: { color: "#BDB6A1", fontSize: 9, marginTop: 3 },
  arrowRow: {
    marginTop: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  arrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(233,185,73,.36)",
    backgroundColor: "rgba(11,11,8,.58)",
  },
  arrowDisabled: {
    borderColor: "rgba(168,163,143,.25)",
    backgroundColor: "rgba(21,21,15,.5)",
  },
  swipeHint: {
    marginTop: 8,
    textAlign: "center",
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(255,255,255,.26)",
  },
  dotActive: {
    width: 22,
    borderRadius: 10,
  },
  details: {
    marginTop: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  previewTitle: {
    color: colors.cream,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  previewMeta: {
    color: "#BDB6A1",
    marginTop: 4,
    textAlign: "center",
    fontSize: 12,
  },
  save: {
    height: 54,
    borderRadius: 17,
    backgroundColor: colors.gold,
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: colors.ink, fontSize: 14, fontWeight: "900" },
});
