import { Platform } from "react-native";

/** True when running as the website (website/ folder), not the phone app. */
export const IS_WEBSITE = Platform.OS === "web";
