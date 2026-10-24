import { Alert } from "react-native";

/** Turn on once the wallpaper photos are uploaded to Firebase. */
export const WALLPAPERS_ENABLED = false;

/** Turn on once Maladharana / Irumudi online registration is ready. */
export const DEEKSHA_REGISTRATION_ENABLED = false;

/** Shared "coming soon" message for features that are not live yet. */
export function showComingSoon(title: string, what = title.toLowerCase()) {
  Alert.alert(title, `Online ${what} is coming soon.`);
}
