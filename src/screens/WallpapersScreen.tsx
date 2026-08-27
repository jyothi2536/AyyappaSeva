import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as MediaLibrary from "expo-media-library";
import { Asset } from "expo-asset";
import { BackButton, Icon, Page, ScreenHeader } from "../components/UI";
import { wallpapers } from "../data/content";
import type { RootStackParamList, Wallpaper } from "../types";
import { colors } from "../theme";

export default function WallpapersScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Wallpapers">) {
  const [selected, setSelected] = useState<Wallpaper | null>(null);
  const save = async () => {
    if (!selected) return;
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted)
      return Alert.alert("Photo permission is required.");
    const asset = Asset.fromModule(selected.source);
    await asset.downloadAsync();
    if (!asset.localUri) return Alert.alert("Unable to prepare wallpaper.");
    await MediaLibrary.saveToLibraryAsync(asset.localUri);
    Alert.alert("Wallpaper saved");
  };
  return (
    <>
      <Page>
        <BackButton navigation={navigation} />
        <ScreenHeader
          eyebrow="DIVINE COLLECTION"
          title="Idol wallpapers"
          subtitle="Preview and save devotional artwork to your phone."
        />
        <View style={s.grid}>
          {wallpapers.map((wallpaper, index) => (
            <Pressable
              key={wallpaper.id}
              onPress={() => setSelected(wallpaper)}
              style={[s.card, index === 0 && s.wide]}
            >
              <Image source={wallpaper.source} style={s.image} />
              <View style={s.shade} />
              <View style={s.copy}>
                <Text style={s.title}>{wallpaper.name}</Text>
                <Text style={s.meta}>{wallpaper.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </Page>
      <Modal
        visible={!!selected}
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <View style={s.preview}>
            <Image
              source={selected.source}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <Pressable style={s.close} onPress={() => setSelected(null)}>
              <Icon name="close" />
            </Pressable>
            <View style={s.footer}>
              <Text style={s.previewTitle}>{selected.name}</Text>
              <Pressable style={s.save} onPress={save}>
                <Icon name="download" color={colors.ink} />
                <Text style={s.saveText}>Save wallpaper</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Modal>
    </>
  );
}
const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "48.5%",
    aspectRatio: 0.61,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  wide: { width: "100%", aspectRatio: 1.18 },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  shade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,.2)",
  },
  copy: { position: "absolute", left: 13, right: 12, bottom: 14 },
  title: { color: colors.cream, fontSize: 14, fontWeight: "800" },
  meta: { color: "#BDB6A1", fontSize: 9, marginTop: 3 },
  preview: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "space-between",
    padding: 18,
  },
  close: {
    alignSelf: "flex-end",
    width: 46,
    height: 46,
    borderRadius: 23,
    marginTop: 35,
    backgroundColor: "rgba(0,0,0,.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { paddingBottom: 25 },
  previewTitle: {
    color: colors.cream,
    fontSize: 29,
    fontWeight: "900",
    marginBottom: 17,
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
