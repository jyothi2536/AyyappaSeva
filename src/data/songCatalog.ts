export type DeityKey =
  | "ganesh"
  | "guru"
  | "murugan"
  | "durga"
  | "shiva"
  | "balaji"
  | "ayyappa";

export const DEITIES: { key: DeityKey; label: string }[] = [
  { key: "ganesh", label: "Ganesh" },
  { key: "guru", label: "Guru" },
  { key: "murugan", label: "Murugan" },
  { key: "durga", label: "Andaal / Durga" },
  { key: "shiva", label: "Shiva" },
  { key: "balaji", label: "Balaji" },
  { key: "ayyappa", label: "Ayyappa" },
];

export type TabLang = "te" | "ta" | "kn";
export const SONG_TABS: { key: TabLang; label: string }[] = [
  { key: "te", label: "తెలుగు" },
  { key: "ta", label: "தமிழ்" },
  { key: "kn", label: "ಕನ್ನಡ" },
];

/** Built-in song id -> deity group. Unlisted songs go under "Other". */
export const SONG_DEITY: Record<string, DeityKey> = {
  "1": "ayyappa",
  "2": "ayyappa",
  "3": "ayyappa",
  "4": "ayyappa",
  "5": "ayyappa",
  "6": "durga",
  "7": "ganesh",
  "8": "murugan",
};
