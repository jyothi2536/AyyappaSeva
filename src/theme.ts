// App colour themes. `colors` is a live object: `applyTheme()` swaps its values,
// and `resolveThemeColor()` lets pre-built StyleSheets follow the active theme
// (see src/themeRuntime.ts).

export type ThemeMode = "light" | "dark";

// Light temple theme: warm ivory pages, white cards, gold accents and a deep
// temple-green navigation bar.
const light = {
  /** Page background. */
  background: "#FBF6EE",
  /** Cards and panels. */
  surface: "#FFFFFF",
  /** Subtle filled areas (chips, inputs, icon tiles). */
  raised: "#F6EEDF",
  /** Primary text. */
  text: "#1F1A12",
  /** Secondary text. */
  muted: "#6E6352",
  /** Gold for accent text, icons and outlines. */
  gold: "#A8761A",
  /** Bright gold for filled buttons and active chips (pair with `ink`). */
  goldFill: "#EBC062",
  /** Dark text and icons placed on gold fills. */
  ink: "#1C1710",
  /** Light text over photos and dark imagery only. */
  cream: "#FFF6E3",
  saffron: "#D9731C",
  /** Deep temple green (navigation bar). */
  green: "#0E4A2F",
  greenSoft: "#E4F0E6",
  success: "#1E7A45",
  red: "#B8322A",
  redSoft: "#FBE4E1",
  line: "rgba(120,90,40,0.16)",
  /** Deep temple maroon (header, headings, banners). */
  maroon: "#6E1A1A",
  /** Darker maroon for header backgrounds. */
  maroonDeep: "#4A0E0E",
  /** Soft maroon/peach tint for icon circles. */
  maroonSoft: "#FBEBDD",
};

// Dark temple theme: near-black pages, warm charcoal cards, bright gold accents.
const dark: typeof light = {
  background: "#0B0B08",
  surface: "#17160F",
  raised: "#211F16",
  text: "#FFF3D6",
  muted: "#A8A38F",
  gold: "#E9B949",
  goldFill: "#E9B949",
  ink: "#1C1710",
  cream: "#FFF6E3",
  saffron: "#F08A24",
  green: "#0C2A1B",
  greenSoft: "#17261B",
  success: "#7CC495",
  red: "#EE8C7E",
  redSoft: "#3A1D18",
  line: "rgba(233,185,73,0.18)",
  maroon: "#F0A08A",
  maroonDeep: "#2A0A0A",
  maroonSoft: "#2E1714",
};

/** Light-only literal colours used directly in screens, with dark equivalents. */
const extraDark: Record<string, string> = {
  "#FFF3D9": "#2A2012", // cream-yellow tiles
  "#FFF1DA": "#2A2012", // saffron icon tiles
  "#FCE4E6": "#33191C", // pink tile
  "#F4FAF5": "#141D16", // green gradient end
  "#3E5A46": "#A9CBB2", // green info text
  "#E4ECFB": "#18202E", // blue tile
  "#E8F0FC": "#18202E", // blue info note
  "#F0E6FA": "#241A2E", // violet tile
  "#2F6FD1": "#8FB4F0", // blue accent
  "#F1E4CC": "#3A3020", // YouTube row border
  "#EEE": "#211F16", // thumbnail placeholder
  "#FFF5F4": "#3A1D18", // YouTube button tint
  "#B3261E": "#EE8C7E", // YouTube button text
  "#6F6A59": "#A8A38F", // admin hint text
};

const lightToDark: Record<string, string> = { ...extraDark };
for (const key of Object.keys(light) as (keyof typeof light)[]) {
  lightToDark[light[key]] ??= dark[key];
}

export const colors = { ...light };

let mode: ThemeMode = "light";

export function currentThemeMode() {
  return mode;
}

/** Date picker theme that matches the app (keeps calendars readable in dark mode). */
export function pickerTheme(): ThemeMode {
  return mode;
}

export function applyTheme(next: ThemeMode) {
  mode = next;
  Object.assign(colors, next === "dark" ? dark : light);
}

/** True if a style value is a themed light colour. */
export function isThemeColor(value: unknown): value is string {
  return typeof value === "string" && Object.hasOwn(lightToDark, value);
}

/** Maps a light-theme colour literal to the active theme. */
export function resolveThemeColor(value: string) {
  return mode === "dark" ? (lightToDark[value] ?? value) : value;
}

export const screenPadding = 18;
