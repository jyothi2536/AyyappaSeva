import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

/** Downloads a wallpaper from its URL and saves it to the phone's photos. */
export async function saveWallpaperAsset(url: string): Promise<void> {
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
  const target = `${FileSystem.cacheDirectory}wallpaper-${Date.now()}.jpg`;
  const download = await FileSystem.downloadAsync(url, target);
  if (download.status !== 200 || !download.uri) {
    throw new Error("Unable to download wallpaper. Check your connection.");
  }
  try {
    await MediaLibrary.saveToLibraryAsync(download.uri);
  } finally {
    await FileSystem.deleteAsync(download.uri, { idempotent: true }).catch(() => undefined);
  }
}
