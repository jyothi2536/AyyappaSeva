import type { NavigatorScreenParams } from "@react-navigation/native";

export type Language = "en" | "te" | "ta" | "kn";
export type LocalizedText = Record<Language, string>;

export type AdminRole = "admin" | "superAdmin";
export type AdminSession = {
  uid: string;
  username: string;
  displayName: string;
  role: AdminRole;
};
export type AdminAccount = AdminSession;

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
  /** Optional photo uploaded by the admin (Firebase Storage download URL). */
  imageUrl?: string;
  /** Storage path of the photo, kept so it can be deleted with the update. */
  imagePath?: string;
};
export type Wallpaper = {
  id: string;
  url: string;
  thumbUrl: string;
  path: string;
  thumbPath: string;
  width: number;
  height: number;
  createdAt: string;
};
export type BuiltInDocument = Song & { assetSource: number; category: string };

export type DeityKey =
  | "ayyappa"
  | "ganapathi"
  | "shiva"
  | "vishnu"
  | "devi"
  | "murugan"
  | "hanuman";

export type ScheduleItem = {
  time: string;
  name: string;
  /** Optional photo for this pooja (Firebase Storage download URL). */
  imageUrl?: string;
  /** Storage path of the photo, kept so it can be deleted. */
  imagePath?: string;
};

export type WeekdayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

/** One weekday's puja at the temple, entered by the admin. */
export type WeeklyDay = {
  /** e.g. "Lord Shiva Puja" */
  name: string;
  /** e.g. "6:30 PM" */
  time: string;
  imageUrl?: string;
  imagePath?: string;
};

/** The repeating weekly schedule shown in "Today at the Temple". */
export type WeeklySchedule = {
  openTime: string;
  closeTime: string;
  days: Partial<Record<WeekdayKey, WeeklyDay>>;
};

export type TodaySchedule = {
  /** YYYY-MM-DD the schedule applies to */
  date: string;
  openTime: string;
  closeTime: string;
  deity: DeityKey;
  items: ScheduleItem[];
};

export type TabParamList = {
  Home: undefined;
  Songs: undefined;
  Updates: undefined;
  Temple: undefined;
  Deeksha: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  Wallpapers: undefined;
  Scriptures: undefined;
  Harivarasanam: undefined;
  Lyrics: { kind: "saranams108" | "deepaaradhana" };
  DocumentReader: { document: Song };
  Admin: undefined;
  AdminTempleEvent: { eventId?: string } | undefined;
  AdminPadiPuja: { eventId?: string } | undefined;
  AdminCalendar: undefined;
  AdminToday: undefined;
  AdminUpdates: undefined;
  AdminWallpapers: undefined;
  DevoteeLogin: { next?: "BookPooja" } | undefined;
  DevoteeSignUp: { next?: "BookPooja" } | undefined;
  BookPooja: undefined;
  ContactTemple: undefined;
  Irumudi: undefined;
  IrumudiRegistration: undefined;
  HomePadiPuja: undefined;
  Maladharana: undefined;
  MaladharanaReview: {
    kind: "maladharana" | "irumudi";
    contact: {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    };
    devotees: { name: string; type: string; date: string }[];
    needItems: boolean;
    qty: Record<string, number>;
    total: number;
  };
};

/** A highlighted festival/event shown in the Home "Upcoming Major Event" section. */
export type MajorEvent = {
  id: string;
  title: string;
  /** ISO date YYYY-MM-DD */
  startDate: string;
  /** ISO date YYYY-MM-DD (same as start for one-day events) */
  endDate: string;
  location: string;
  details: string;
};
export type MajorEventInput = Omit<MajorEvent, "id">;
