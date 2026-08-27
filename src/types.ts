import type { NavigatorScreenParams } from "@react-navigation/native";

export type Language = "en" | "te" | "ta" | "kn";
export type LocalizedText = Record<Language, string>;

export type BaseCalendarEvent = {
  id: string;
  kind: "temple" | "padiPuja";
  title: LocalizedText;
  description: LocalizedText;
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  contactName?: string;
  contactPhone?: string;
  remindersEnabled: boolean;
  notificationIds?: string[];
  createdAt: string;
};

export type TempleCalendarEvent = BaseCalendarEvent & {
  kind: "temple";
};

export type PadiPujaCalendarEvent = BaseCalendarEvent & {
  kind: "padiPuja";
  devoteeName: string;
  familyName?: string;
};

export type CalendarEvent = TempleCalendarEvent | PadiPujaCalendarEvent;
export type TempleCalendarEventInput = Omit<
  TempleCalendarEvent,
  "id" | "createdAt" | "notificationIds"
>;
export type PadiPujaCalendarEventInput = Omit<
  PadiPujaCalendarEvent,
  "id" | "createdAt" | "notificationIds"
>;
export type CalendarEventInput =
  | TempleCalendarEventInput
  | PadiPujaCalendarEventInput;
export type Song = {
  id: string;
  title: string;
  subtitle: string;
  type: "PDF" | "DOCX" | "DOC" | "TXT" | "AUDIO";
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
  AdminTempleEvent: undefined;
  AdminPadiPuja: undefined;
  AdminCalendar: undefined;
};
