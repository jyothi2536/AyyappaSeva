import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon, Page, ScreenHeader } from "../components/UI";
import { PhotoThumb } from "../components/EventPhoto";
import { localizedUpdates } from "../data/content";
import { formatEventDate, localize } from "../data/events";
import { removeTempleUpdate } from "../services/firebase";
import { useApp } from "../state/AppContext";
import type { CalendarEvent, Update } from "../types";
import { colors } from "../theme";

type MainSection = "events" | "announcements";
type EventFilter = "all" | CalendarEvent["kind"];

export default function UpdatesScreen() {
  const { language, updates, events, eventT, isAdmin } = useApp();
  const [section, setSection] = useState<MainSection>("events");
  const confirmDelete = (update: Update) => {
    Alert.alert("Delete this update?", `"${update.title}" will be removed for everyone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void removeTempleUpdate(update).catch((reason) =>
            Alert.alert("Unable to delete", reason instanceof Error ? reason.message : "Please try again."),
          );
        },
      },
    ]);
  };
  const [filter, setFilter] = useState<EventFilter>("all");
  const announcements = language === "en" ? updates : localizedUpdates[language];
  const visibleEvents = events
    .filter((event) => filter === "all" || event.kind === filter)
    .sort((a, b) =>
      `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`),
    );
  return (
    <Page>
      <ScreenHeader eyebrow={eventT.upcoming} title={eventT.events} />
      <View style={s.mainTabs}>
        <Tab
          active={section === "events"}
          label={eventT.events}
          onPress={() => setSection("events")}
        />
        <Tab
          active={section === "announcements"}
          label={eventT.announcements}
          onPress={() => setSection("announcements")}
        />
      </View>
      {section === "events" ? (
        <>
          <View style={s.filters}>
            <Filter active={filter === "all"} label={eventT.all} onPress={() => setFilter("all")} />
            <Filter active={filter === "temple"} label={eventT.templeEvents} onPress={() => setFilter("temple")} />
            <Filter active={filter === "padiPuja"} label={eventT.padiPujas} onPress={() => setFilter("padiPuja")} />
          </View>
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {!visibleEvents.length ? (
            <View style={s.empty}>
              <Icon name="calendar-clear-outline" size={34} color={colors.gold} />
              <Text style={s.emptyText}>{eventT.noEvents}</Text>
            </View>
          ) : null}
        </>
      ) : (
        <>
          {announcements.map((item, index) => (
            <View key={item.id} style={[s.card, index === 0 && s.feature]}>
              <View style={s.row}>
                <Icon name={index === 0 ? "notifications" : "megaphone-outline"} size={19} color={colors.gold} />
                <Text style={s.title}>{item.title}</Text>
                <Text style={s.date}>{item.date}</Text>
              </View>
              <Text style={s.body}>{item.body}</Text>
              {"imageUrl" in item && item.imageUrl ? (
                <View style={{ marginTop: 10 }}>
                  <PhotoThumb uri={item.imageUrl} label={item.title} style={s.photo} />
                </View>
              ) : null}
              {isAdmin ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.title}`}
                  style={s.deleteBtn}
                  onPress={() => {
                    const original = updates.find((u) => u.id === item.id);
                    if (original) confirmDelete(original);
                  }}
                >
                  <Icon name="trash-outline" size={16} color={colors.red} />
                  <Text style={s.deleteText}>Delete</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </>
      )}
    </Page>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  const { language, eventT } = useApp();
  const navigation = useNavigation<any>();
  const padi = event.kind === "padiPuja";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={localize(event.title, language)}
      onPress={() => navigation.navigate("EventDetail", { eventId: event.id })}
      style={[s.eventCard, padi && s.padiCard]}
    >
      <View style={[s.eventIcon, padi && s.padiIcon]}>
        <Icon name={padi ? "home" : "business"} color={colors.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.row}>
          <Text style={s.kind}>{padi ? eventT.padiPuja : eventT.templeEvent}</Text>
          {event.remindersEnabled ? <Icon name="notifications-outline" size={15} color={colors.gold} /> : null}
        </View>
        <Text style={s.eventTitle}>{localize(event.title, language)}</Text>
        <Text style={s.schedule}>
          {formatEventDate(event, language)} · {event.startTime}
          {event.endTime ? `–${event.endTime}` : ""}
        </Text>
        <Text style={s.venue}>{event.venue}</Text>
        {padi ? (
          <Text style={s.host}>
            {eventT.hostedBy}: {event.devoteeName}
            {event.familyName ? ` · ${event.familyName}` : ""}
          </Text>
        ) : null}
        <Text style={s.body}>{localize(event.description, language)}</Text>
        {event.contactName || event.contactPhone ? (
          <Text style={s.contact}>
            {[event.contactName, event.contactPhone].filter(Boolean).join(" · ")}
          </Text>
        ) : null}
        <Text style={s.more}>{event.imageUrl ? "Tap for picture & details" : "Tap for details"}</Text>
      </View>
    </Pressable>
  );
}

function Tab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[s.mainTab, active && s.mainTabActive]} onPress={onPress}>
      <Text style={[s.mainTabText, active && s.mainTabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Filter({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[s.filter, active && s.filterActive]} onPress={onPress}>
      <Text style={[s.filterText, active && s.filterTextActive]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  deleteBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: 12, paddingVertical: 6 },
  deleteText: { color: colors.red, fontSize: 13, fontWeight: "800" },
  mainTabs: { flexDirection: "row", borderRadius: 17, backgroundColor: colors.surface, padding: 4, marginBottom: 13 },
  mainTab: { flex: 1, minHeight: 43, alignItems: "center", justifyContent: "center" },
  mainTabActive: { backgroundColor: colors.goldFill, borderRadius: 14 },
  mainTabText: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  mainTabTextActive: { color: colors.ink },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 13 },
  filter: { minHeight: 38, borderRadius: 19, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  filterActive: { backgroundColor: "rgba(233,185,73,.13)", borderColor: colors.gold },
  filterText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  filterTextActive: { color: colors.gold },
  eventCard: { flexDirection: "row", gap: 12, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: "rgba(233,185,73,.28)", padding: 15, marginBottom: 11 },
  padiCard: { backgroundColor: colors.surface, borderColor: colors.line },
  eventIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.goldFill, alignItems: "center", justifyContent: "center" },
  padiIcon: { backgroundColor: "#87AC87" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  kind: { flex: 1, color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  eventTitle: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 5 },
  schedule: { color: colors.gold, fontSize: 10, fontWeight: "700", marginTop: 7 },
  venue: { color: colors.muted, fontSize: 10, marginTop: 4 },
  host: { color: colors.muted, fontSize: 10, fontWeight: "700", marginTop: 5 },
  more: { color: colors.gold, fontSize: 10, fontWeight: "800", marginTop: 8 },
  contact: { color: colors.muted, fontSize: 9, marginTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 10 },
  feature: { backgroundColor: colors.surface },
  title: { color: colors.text, flex: 1, fontSize: 14, fontWeight: "800" },
  date: { color: colors.gold, fontSize: 9 },
  body: { color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 7 },
  photo: { width: "100%", height: 180, borderRadius: 12 },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyText: { color: colors.muted, marginTop: 10 },
});
