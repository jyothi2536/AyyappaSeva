import { Platform } from "react-native";
import { Asset } from "expo-asset";
import * as MediaLibrary from "expo-media-library";

export async function saveWallpaperAsset(source: number): Promise<void> {
  if (Platform.OS === "android") {
    // expo-media-library requires legacy write access through Android 12L.
    // Android 13+ can save our own bundled image without reading the gallery.
    if (Number(Platform.Version) < 33) {
      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (!permission.granted) {
        throw new Error("Storage permission is required to save this wallpaper.");
      }
    }
  } else {
    // Preserve the existing iOS permission flow in the submitted iOS version.
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Photo permission is required.");
    }
  }
  const asset = Asset.fromModule(source);
  await asset.downloadAsync();
  if (!asset.localUri) throw new Error("Unable to prepare wallpaper.");
  await MediaLibrary.saveToLibraryAsync(asset.localUri);
}
