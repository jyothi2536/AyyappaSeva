// Must be imported before any screen module. It wraps StyleSheet.create so the
// colour values in every stylesheet are read lazily from the active theme,
// letting the whole app switch between light and dark without a restart.
import { StyleSheet } from "react-native";
import { isThemeColor, resolveThemeColor } from "./theme";

type StyleRecord = Record<string, unknown>;

function themeStyle(style: StyleRecord): StyleRecord {
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
