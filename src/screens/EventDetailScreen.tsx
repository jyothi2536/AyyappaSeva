import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton, Icon, Page } from "../components/UI";
import { PhotoThumb } from "../components/EventPhoto";
import { formatEventDate, localize } from "../data/events";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

export default function EventDetailScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "EventDetail">) {
  const { events, language, eventT } = useApp();
  const event = events.find((item) => item.id === route.params.eventId);

  if (!event) {
    return (
      <Page>
        <BackButton navigation={navigation} />
        <Text style={s.empty}>{eventT.noEvents}</Text>
      </Page>
    );
  }

  const padi = event.kind === "padiPuja";
  const title = localize(event.title, language);
  return (
    <Page>
      <BackButton navigation={navigation} />
      {event.imageUrl ? (
        <PhotoThumb uri={event.imageUrl} label={title} style={s.photo} />
      ) : null}
      <Text style={s.kind}>{padi ? eventT.padiPuja : eventT.templeEvent}</Text>
      <Text style={s.title}>{title}</Text>
      <View style={s.row}>
        <Icon name="calendar-outline" size={16} color={colors.gold} />
        <Text style={s.schedule}>
          {formatEventDate(event, language)} · {event.startTime}
          {event.endTime ? `–${event.endTime}` : ""}
        </Text>
      </View>
      <View style={s.row}>
        <Icon name="location-outline" size={16} color={colors.gold} />
        <Text style={s.venue}>{event.venue}</Text>
      </View>
      {padi ? (
        <View style={s.row}>
          <Icon name="home-outline" size={16} color={colors.gold} />
          <Text style={s.venue}>
            {eventT.hostedBy}: {event.devoteeName}
            {event.familyName ? ` · ${event.familyName}` : ""}
          </Text>
        </View>
      ) : null}
      <Text style={s.body}>{localize(event.description, language)}</Text>
      {event.contactName || event.contactPhone ? (
        <View style={s.card}>
          <Text style={s.cardLabel}>{eventT.contactName}</Text>
          <Text style={s.cardText}>
            {[event.contactName, event.contactPhone].filter(Boolean).join(" · ")}
          </Text>
          {event.contactPhone ? (
            <Pressable
              accessibilityRole="button"
              style={s.call}
              onPress={() => void Linking.openURL(`tel:${event.contactPhone}`)}
            >
              <Icon name="call-outline" size={16} color={colors.gold} />
              <Text style={s.callText}>{event.contactPhone}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Page>
  );
}

const s = StyleSheet.create({
  photo: { width: "100%", height: 240, borderRadius: 16, marginBottom: 14 },
  kind: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.text, fontSize: 22, fontWeight: "900", marginTop: 6, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  schedule: { flex: 1, color: colors.gold, fontSize: 13, fontWeight: "700" },
  venue: { flex: 1, color: colors.muted, fontSize: 13 },
  body: { color: colors.text, fontSize: 14, lineHeight: 22, marginTop: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginTop: 18,
  },
  cardLabel: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  cardText: { color: colors.text, fontSize: 14, marginTop: 4 },
  call: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  callText: { color: colors.gold, fontSize: 13, fontWeight: "800" },
  empty: { color: colors.muted, marginTop: 30, textAlign: "center" },
});
