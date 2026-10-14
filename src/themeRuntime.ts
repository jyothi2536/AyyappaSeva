// Must be imported before any screen module. It wraps StyleSheet.create so the
// colour values in every stylesheet are read lazily from the active theme,
// letting the whole app switch between light and dark without a restart.
import { StyleSheet } from "react-native";
import { isThemeColor, resolveThemeColor } from "./theme";

type StyleRecord = Record<string, unknown>;

// App-wide Montserrat. Custom fonts need one family per weight/style on
// Android, so text styles get their fontWeight/fontStyle mapped to the
// matching Montserrat file (loaded in App.tsx).
const TEXT_KEYS = ["fontSize", "fontWeight", "fontFamily", "fontStyle", "lineHeight", "letterSpacing"];
const WEIGHT_NAMES: Record<string, string> = {
  "100": "100Thin",
  "200": "200ExtraLight",
  "300": "300Light",
  "400": "400Regular",
  normal: "400Regular",
  "500": "500Medium",
  "600": "600SemiBold",
  "700": "700Bold",
  bold: "700Bold",
  "800": "800ExtraBold",
  "900": "900Black",
};

export function montserratFamily(weight?: unknown, style?: unknown) {
  const name = WEIGHT_NAMES[String(weight ?? "400")] ?? "400Regular";
  // Only these italic files are loaded in App.tsx.
  const italic =
    style === "italic" && ["400Regular", "600SemiBold", "700Bold"].includes(name);
  return `Montserrat_${name}${italic ? "_Italic" : ""}`;
}

function applyMontserrat(style: StyleRecord): StyleRecord {
  if (!TEXT_KEYS.some((key) => key in style)) return style;
  const family = style.fontFamily;
  // Leave icon fonts and explicitly chosen non-default families alone.
  if (typeof family === "string" && family !== "serif" && family !== "System") {
    return style;
  }
  const { fontWeight, fontStyle, ...rest } = style;
  return { ...rest, fontFamily: montserratFamily(fontWeight, fontStyle) };
}

function themeStyle(style: StyleRecord): StyleRecord {
  style = applyMontserrat(style);
  const out: StyleRecord = {};
  for (const key of Object.keys(style)) {
    const value = style[key];
    if (isThemeColor(value)) {
      Object.defineProperty(out, key, {
        enumerable: true,
        configurable: true,
        get: () => resolveThemeColor(value),
      });
    } else {
      out[key] = value;
    }
  }
  return out;
}

const originalCreate = StyleSheet.create.bind(StyleSheet);

try {
  (StyleSheet as { create: typeof StyleSheet.create }).create = ((styles: Record<string, StyleRecord>) => {
    const created = originalCreate(styles) as Record<string, unknown>;
    const themed: Record<string, unknown> = {};
    for (const name of Object.keys(created)) {
      const style = created[name];
      themed[name] =
        style && typeof style === "object" && !Array.isArray(style)
          ? themeStyle(style as StyleRecord)
          : style;
    }
    return themed;
  }) as typeof StyleSheet.create;
} catch {
  // If StyleSheet cannot be patched, styles stay in the light theme.
}
