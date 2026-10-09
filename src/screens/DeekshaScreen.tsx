import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, Icon, Page, ScreenHeader } from "../components/UI";
import { colors } from "../theme";

const guidelines: { icon: React.ComponentProps<typeof Icon>["name"]; title: string; body: string }[] = [
  {
    icon: "ellipse-outline",
    title: "Mala Dharana",
    body: "Deeksha begins by wearing the sacred Tulasi or Rudraksha mala, blessed by a Guru Swamy at the temple.",
  },
  {
    icon: "calendar-outline",
    title: "41-day Mandala Vratham",
    body: "Observe the vratham for 41 days with discipline, prayer and simplicity before the Sabarimala yatra.",
  },
  {
    icon: "sunny-outline",
    title: "Daily Routine",
    body: "Bathe twice a day, perform pooja morning and evening, and chant the Swamy Saranam.",
  },
  {
    icon: "leaf-outline",
    title: "Sattvic Living",
    body: "Follow a vegetarian diet, abstain from alcohol and tobacco, and practise celibacy and humility.",
  },
  {
    icon: "shirt-outline",
    title: "Attire",
    body: "Wear black, blue or saffron clothing and walk barefoot as a mark of devotion.",
  },
];

export default function DeekshaScreen() {
  return (
    <Page>
      <ScreenHeader eyebrow="Ayyappa Mala" title="Deeksha" />
      {guidelines.map((item) => (
        <Card key={item.title}>
          <View style={s.card}>
          <View style={s.icon}>
            <Icon name={item.icon} size={22} color={colors.saffron} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.body}>{item.body}</Text>
          </View>
          </View>
        </Card>
      ))}
    </Page>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 11 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF1DA",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: colors.text, fontSize: 15, fontWeight: "800" },
  body: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
});
