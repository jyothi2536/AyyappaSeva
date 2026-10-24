import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import type { WallpaperUpload } from "./firebase";

/** Long-side limits keep files small while staying sharp on phones and foldables. */
const FULL_SHORT_SIDE = 1440;
const THUMB_SHORT_SIDE = 400;
/** Photos narrower than this look soft as a full-screen wallpaper. */
export const MIN_WALLPAPER_SHORT_SIDE = 1080;

export type PickedWallpaper = WallpaperUpload | { rejected: string };

/** Lets an admin pick photos (the system photo picker needs no gallery permission). */
export async function pickWallpaperPhotos(): Promise<ImagePicker.ImagePickerAsset[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: 20,
    quality: 1,
  });
  return result.canceled ? [] : result.assets;
}

/** Converts any photo (HEIC, PNG…) to phone-sized JPEG plus a small preview. */
export async function prepareWallpaper(
  asset: Pick<ImagePicker.ImagePickerAsset, "uri" | "width" | "height">,
): Promise<PickedWallpaper> {
  const { uri, width, height } = asset;
  if (Math.min(width, height) < MIN_WALLPAPER_SHORT_SIDE) {
    return { rejected: `Too small (${width}×${height}). Use photos at least ${MIN_WALLPAPER_SHORT_SIDE}px wide.` };
  }
  if (height < width * 1.2) {
    return { rejected: "Sideways or square photo. Use an upright (portrait) photo." };
  }
  const fullWidth = Math.min(width, FULL_SHORT_SIDE);
  const full = await manipulateAsync(uri, [{ resize: { width: fullWidth } }], {
    compress: 0.82,
    format: SaveFormat.JPEG,
  });
  const thumb = await manipulateAsync(uri, [{ resize: { width: THUMB_SHORT_SIDE } }], {
    compress: 0.75,
    format: SaveFormat.JPEG,
  });
  return { uri: full.uri, thumbUri: thumb.uri, width: full.width, height: full.height };
}
