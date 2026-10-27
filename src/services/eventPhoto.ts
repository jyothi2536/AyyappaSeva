import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

/** Wide enough to look sharp full-screen on a phone, small enough to load fast. */
const MAX_WIDTH = 1200;

/**
 * Lets an admin pick one photo (the system photo picker needs no gallery
 * permission) and returns it resized to a JPEG ready for upload, or null if cancelled.
 */
export async function pickEventPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: false,
    quality: 1,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  const resized = await manipulateAsync(
    asset.uri,
    asset.width > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [],
    { compress: 0.82, format: SaveFormat.JPEG },
  );
  return resized.uri;
}
