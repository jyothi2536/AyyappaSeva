import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { formatEventDate, localize } from "../data/events";
import { BackButton, Icon, Page, ScreenHeader } from "../components/UI";
import { useApp } from "../state/AppContext";
import type { CalendarEvent, RootStackParamList } from "../types";
import { colors } from "../theme";

export default function AdminCalendarScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "AdminCalendar">) {
  const {
    events,
    eventT,
    language,
    deleteCalendarEvent,
    deleteCalendarYear,
  } = useApp();
  const years = useMemo(() => {
    const values = new Set(events.map((event) => Number(event.date.slice(0, 4))));
    values.add(new Date().getFullYear());
    return [...values].filter(Number.isFinite).sort((a, b) => a - b);
  }, [events]);
  const [selectedYear, setSelectedYear] = useState(
    years.includes(new Date().getFullYear())
      ? new Date().getFullYear()
      : (years[0] ?? new Date().getFullYear()),
  );
  const yearEvents = events.filter(
    (event) => Number(event.date.slice(0, 4)) === selectedYear,
  );
  const groups = yearEvents.reduce<Record<string, CalendarEvent[]>>(
    (result, event) => {
      const month = event.date.slice(0, 7);
      (result[month] ??= []).push(event);
      return result;
    },
    {},
  );

  const removeYear = () =>
    Alert.alert(
      `${eventT.deleteYear} ${selectedYear}?`,
      eventT.deleteYearMessage,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteCalendarYear(selectedYear),
        },
      ],
    );

  const removeEvent = (event: CalendarEvent) =>
    Alert.alert(localize(event.title, language), "Delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void deleteCalendarEvent(event.id),
      },
    ]);

  return (
    <Page>
      <BackButton navigation={navigation} />
      <ScreenHeader
        eyebrow={eventT.manageSchedule}
        title={eventT.adminCalendar}
        subtitle={eventT.calendarSubtitle}
      />
      <View style={s.actions}>
        <Action
          icon="business"
          label={eventT.createTempleEvent}
          onPress={() => navigation.navigate("AdminTempleEvent")}
        />
        <Action
          icon="home"
          label={eventT.createPadiPuja}
          onPress={() => navigation.navigate("AdminPadiPuja")}
        />
      </View>
      <Text style={s.note}>{eventT.scheduleNote}</Text>
      <View style={s.yearRow}>
        {years.map((year) => (
          <Pressable
            key={year}
            style={[s.year, selectedYear === year && s.yearActive]}
            onPress={() => setSelectedYear(year)}
          >
            <Text
              style={[s.yearText, selectedYear === year && s.yearTextActive]}
            >
              {year}
            </Text>
          </Pressable>
        ))}
      </View>
      {Object.entries(groups).map(([month, items]) => (
        <View key={month}>
          <Text style={s.month}>{formatMonth(month, language)}</Text>
          {items.map((event) => (
            <View key={event.id} style={s.card}>
              <View style={[s.dateBadge, event.kind === "padiPuja" && s.homeBadge]}>
                <Text style={s.day}>{event.date.slice(8, 10)}</Text>
                <Icon
                  name={event.kind === "temple" ? "business" : "home"}
                  size={14}
                  color={colors.ink}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.kind}>
                  {event.kind === "temple"
                    ? eventT.templeEvent
                    : eventT.padiPuja}
                </Text>
                <Text style={s.title}>{localize(event.title, language)}</Text>
                <Text style={s.meta}>
                  {formatEventDate(event, language)} · {event.startTime}
                  {event.endTime ? `–${event.endTime}` : ""}
                </Text>
                <Text style={s.meta}>{event.venue}</Text>
                {event.kind === "padiPuja" ? (
                  <Text style={s.host}>
                    {eventT.hostedBy}: {event.devoteeName}
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => removeEvent(event)}
                style={s.trash}
              >
                <Icon name="trash-outline" size={19} color="#D47D72" />
              </Pressable>
            </View>
          ))}
        </View>
      ))}
      {!yearEvents.length ? (
        <View style={s.empty}>
          <Icon name="calendar-clear-outline" size={32} color={colors.gold} />
          <Text style={s.emptyText}>{eventT.noEvents}</Text>
        </View>
      ) : (
        <Pressable style={s.deleteYear} onPress={removeYear}>
          <Icon name="trash-outline" color="#D47D72" />
          <Text style={s.deleteText}>
            {eventT.deleteYear} {selectedYear}
          </Text>
        </Pressable>
      )}
    </Page>
  );
}

function formatMonth(month: string, language: "en" | "te" | "ta" | "kn") {
  const [yearValue, monthValue] = month.split("-").map(Number);
  const locale = { en: "en-US", te: "te-IN", ta: "ta-IN", kn: "kn-IN" }[
    language
  ];
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(yearValue ?? 0, (monthValue ?? 1) - 1, 1),
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
    <Pressable style={s.action} onPress={onPress}>
      <Icon name={icon} color={colors.gold} />
      <Text style={s.actionText}>{label}</Text>
      <Icon name="chevron-forward" size={16} color={colors.gold} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  actions: { gap: 9 },
  action: {
    minHeight: 58,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  actionText: { flex: 1, color: colors.cream, fontSize: 12, fontWeight: "800" },
  note: { color: colors.muted, fontSize: 10, marginTop: 10 },
  yearRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 20 },
  year: {
    paddingHorizontal: 15,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  yearActive: { backgroundColor: colors.gold },
  yearText: { color: colors.cream, fontSize: 12, fontWeight: "800" },
  yearTextActive: { color: colors.ink },
  month: { color: colors.gold, fontSize: 12, fontWeight: "900", marginBottom: 9 },
  card: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
    marginBottom: 9,
  },
  dateBadge: {
    width: 48,
    height: 58,
    borderRadius: 15,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  homeBadge: { backgroundColor: "#87AC87" },
  day: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  kind: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.cream, fontSize: 14, fontWeight: "800", marginTop: 3 },
  meta: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  host: { color: "#A8C4A5", fontSize: 10, marginTop: 4 },
  trash: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingVertical: 45 },
  emptyText: { color: colors.muted, marginTop: 10 },
  deleteYear: {
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(212,125,114,.35)",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  deleteText: { color: "#D47D72", fontSize: 12, fontWeight: "800" },
});
