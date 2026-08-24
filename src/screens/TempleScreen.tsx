import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, Page, ScreenHeader } from "../components/UI";
import { TEMPLE } from "../data/content";
import { useApp } from "../state/AppContext";
import { colors } from "../theme";

export default function TempleScreen() {
  const { t } = useApp();
  const map = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${TEMPLE.latitude},${TEMPLE.longitude}`,
    );
  return (
    <Page>
      <ScreenHeader
        eyebrow={t.temple}
        title={TEMPLE.name}
        subtitle={TEMPLE.fullName}
      />
      <Pressable style={s.map} onPress={map}>
        <View style={s.pin}>
          <Icon name="location" size={28} color={colors.ink} />
        </View>
        <Text style={s.mapTitle}>{TEMPLE.shortAddress}</Text>
        <Text style={s.mapSub}>{t.openMap}</Text>
      </Pressable>
      <View style={s.actions}>
        <Action icon="navigate" label={t.directions} onPress={map} />
        <Action
          icon="call"
          label={t.call}
          onPress={() => Linking.openURL(`tel:${TEMPLE.phone}`)}
        />
      </View>
      <View style={s.card}>
        <Info
          icon="time-outline"
          title={t.timings}
          text={`${t.morning}: 6:00 AM – 11:00 AM\n${t.eveningTime}: 5:30 PM – 8:30 PM`}
        />
        <Info icon="location-outline" title={t.contact} text={TEMPLE.address} />
        <Info icon="call-outline" title={TEMPLE.phone} text={TEMPLE.email} />
      </View>
    </Page>
  );
}
function Action({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={s.action}>
      <Icon name={icon} color={colors.ink} />
      <Text style={s.actionText}>{label}</Text>
    </Pressable>
  );
}
function Info({
  icon,
  title,
  text,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  text: string;
}) {
  return (
    <View style={s.info}>
      <Icon name={icon} color={colors.gold} />
      <View>
        <Text style={s.infoTitle}>{title}</Text>
        <Text style={s.infoText}>{text}</Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  map: {
    height: 220,
    borderRadius: 24,
    backgroundColor: "#18231A",
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  pin: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  mapTitle: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 13,
  },
  mapSub: { color: colors.gold, fontSize: 10, marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginVertical: 12 },
  action: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.gold,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { color: colors.ink, fontSize: 11, fontWeight: "900" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  info: { flexDirection: "row", gap: 13, paddingVertical: 13 },
  infoTitle: { color: colors.cream, fontSize: 13, fontWeight: "800" },
  infoText: { color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 4 },
});
