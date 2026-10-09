import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { languages } from "../data/content";
import { useApp } from "../state/AppContext";
import { colors } from "../theme";

/**
 * The app UI is English-only, but devotional lyrics and documents in the
 * music section can be read in every supported script.
 */
export function LyricsLanguagePicker() {
  const { lyricsLanguage, setLyricsLanguage } = useApp();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.row}
      accessibilityRole="tablist"
    >
      {languages.map((item) => {
        const active = item.id === lyricsLanguage;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Show lyrics in ${item.label}`}
            onPress={() => setLyricsLanguage(item.id)}
            style={[s.chip, active && s.active]}
          >
            <Text style={[s.native, active && s.activeText]}>{item.native}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  active: { backgroundColor: colors.goldFill, borderColor: colors.goldFill },
  native: { color: colors.text, fontSize: 13, fontWeight: "800" },
  activeText: { color: colors.ink },
});
