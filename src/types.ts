import type { NavigatorScreenParams } from "@react-navigation/native";

export type Language = "en" | "te" | "ta" | "kn";
export type Song = {
  id: string;
  title: string;
  subtitle: string;
  type: "PDF" | "DOCX" | "TXT" | "AUDIO";
  uri?: string;
  size?: number;
  mimeType?: string;
};
export type Update = {
  id: string;
  title: string;
  body: string;
  date: string;
  pinned?: boolean;
};
export type Wallpaper = {
  id: string;
  name: string;
  subtitle: string;
  source: number;
  accent: string;
};
export type BuiltInDocument = Song & { assetSource: number; category: string };

export type TabParamList = {
  Home: undefined;
  Songs: undefined;
  Updates: undefined;
  Temple: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  Downloads: undefined;
  Wallpapers: undefined;
  Scriptures: undefined;
  Harivarasanam: undefined;
  Lyrics: { kind: "saranams108" | "deepaaradhana" };
  DocumentReader: { document: Song };
  Registration: undefined;
  Admin: undefined;
};
