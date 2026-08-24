import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon, Page, ScreenHeader } from "../components/UI";
import { localizedUpdates } from "../data/content";
import { useApp } from "../state/AppContext";
import { colors } from "../theme";

export default function UpdatesScreen() {
  const { t, language, updates } = useApp();
  const items = language === "en" ? updates : localizedUpdates[language];
  return (
    <Page>
      <ScreenHeader eyebrow={t.latest} title={t.updates} />
      <View style={s.feature}>
        <Icon name="notifications" color={colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={s.featureTitle}>{items[0]?.title}</Text>
          <Text style={s.body}>{items[0]?.body}</Text>
        </View>
      </View>
      {items.slice(1).map((item) => (
        <View key={item.id} style={s.card}>
          <View style={s.row}>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.date}>{item.date}</Text>
          </View>
          <Text style={s.body}>{item.body}</Text>
        </View>
      ))}
    </Page>
  );
}
const s = StyleSheet.create({
  feature: {
    backgroundColor: "#282115",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
  },
  featureTitle: { color: colors.cream, fontSize: 16, fontWeight: "800" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 10 },
  title: { color: colors.cream, flex: 1, fontSize: 14, fontWeight: "800" },
  date: { color: colors.gold, fontSize: 9 },
  body: { color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 7 },
});
