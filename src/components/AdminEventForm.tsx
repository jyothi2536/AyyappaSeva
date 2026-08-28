import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TEMPLE } from "../data/content";
import { useApp } from "../state/AppContext";
import type { CalendarEvent, Language, LocalizedText } from "../types";
import { colors } from "../theme";
import { GoldButton, Icon } from "./UI";

function blankLocalized(): LocalizedText {
  return { en: "", te: "", ta: "", kn: "" };
}

function defaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromIso(value: string) {
  const parts = value.split("-").map(Number);
  const parsed = new Date(
    parts[0] ?? new Date().getFullYear(),
    (parts[1] || 1) - 1,
    parts[2] || 1,
    12,
  );
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function dateToIso(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function formattedDate(value: string, language: Language) {
  const locale = { en: "en-US", te: "te-IN", ta: "ta-IN", kn: "kn-IN" }[
    language
  ];
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateFromIso(value));
}

function fillTranslations(
  value: LocalizedText,
  sourceLanguage: Language,
): LocalizedText {
  const fallback = value[sourceLanguage].trim();
  return {
    en: value.en.trim() || fallback,
    te: value.te.trim() || fallback,
    ta: value.ta.trim() || fallback,
    kn: value.kn.trim() || fallback,
  };
}

export function AdminEventForm({
  kind,
  initialEvent,
  onSaved,
}: {
  kind: "temple" | "padiPuja";
  initialEvent?: CalendarEvent;
  onSaved: () => void;
}) {
  const { eventT, language, createCalendarEvent, editCalendarEvent } = useApp();
  const [title, setTitle] = useState<LocalizedText>(() =>
    initialEvent ? { ...initialEvent.title } : blankLocalized(),
  );
  const [description, setDescription] = useState<LocalizedText>(() =>
    initialEvent ? { ...initialEvent.description } : blankLocalized(),
  );
  const [date, setDate] = useState(() => initialEvent?.date ?? defaultDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(initialEvent?.startTime ?? "18:30");
  const [endTime, setEndTime] = useState(initialEvent?.endTime ?? "20:00");
  const [venue, setVenue] = useState(
    initialEvent?.venue ?? (kind === "temple" ? TEMPLE.shortAddress : ""),
  );
  const [contactName, setContactName] = useState(initialEvent?.contactName ?? "");
  const [contactPhone, setContactPhone] = useState(initialEvent?.contactPhone ?? "");
  const [devoteeName, setDevoteeName] = useState(
    initialEvent?.kind === "padiPuja" ? initialEvent.devoteeName : "",
  );
  const [familyName, setFamilyName] = useState(
    initialEvent?.kind === "padiPuja" ? initialEvent.familyName ?? "" : "",
  );
  const [remindersEnabled, setRemindersEnabled] = useState(
    initialEvent?.remindersEnabled ?? true,
  );
  const [saving, setSaving] = useState(false);

  const updateLocalized = (
    setter: React.Dispatch<React.SetStateAction<LocalizedText>>,
    value: string,
  ) => setter((current) => ({ ...current, [language]: value }));

  const save = async () => {
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    const validStart = /^([01]\d|2[0-3]):[0-5]\d$/.test(startTime);
    const validEnd = !endTime || /^([01]\d|2[0-3]):[0-5]\d$/.test(endTime);
    if (!title[language].trim() || !description[language].trim()) {
      Alert.alert("Event title and description are required.");
      return;
    }
    if (!validDate || !validStart || !validEnd) {
      Alert.alert(
        "Check the schedule",
        "Use YYYY-MM-DD for the date and 24-hour HH:MM for times.",
      );
      return;
    }
    if (!venue.trim()) {
      Alert.alert(kind === "temple" ? eventT.venue : eventT.address);
      return;
    }
    if (kind === "padiPuja" && !devoteeName.trim()) {
      Alert.alert(eventT.devoteeName);
      return;
    }
    setSaving(true);
    try {
      const common = {
        title: fillTranslations(title, language),
        description: fillTranslations(description, language),
        date,
        startTime,
        endTime: endTime || undefined,
        venue: venue.trim(),
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        remindersEnabled,
      };
      if (kind === "temple") {
        const input = { ...common, kind: "temple" } as const;
        if (initialEvent) await editCalendarEvent(initialEvent.id, input);
        else await createCalendarEvent(input);
      } else {
        const input = {
          ...common,
          kind: "padiPuja",
          devoteeName: devoteeName.trim(),
          familyName: familyName.trim() || undefined,
        } as const;
        if (initialEvent) await editCalendarEvent(initialEvent.id, input);
        else await createCalendarEvent(input);
      }
      Alert.alert(initialEvent ? eventT.updated : eventT.saved);
      onSaved();
    } catch (reason) {
      Alert.alert(
        "Unable to save event",
        reason instanceof Error ? reason.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Field
        label={eventT.eventTitle}
        value={title[language]}
        onChange={(value) => updateLocalized(setTitle, value)}
      />
      <Field
        label={eventT.description}
        value={description[language]}
        onChange={(value) => updateLocalized(setDescription, value)}
        multiline
      />

      <View style={s.sectionHeader}>
        <Icon name="calendar" color={colors.gold} />
        <Text style={s.sectionTitle}>{eventT.upcoming}</Text>
      </View>
      <Text style={s.label}>{eventT.date}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${eventT.date}: ${formattedDate(date, language)}`}
        style={[s.dateButton, showDatePicker && s.dateButtonActive]}
        onPress={() => setShowDatePicker((current) => !current)}
      >
        <View style={s.dateIcon}>
          <Icon name="calendar-outline" color={colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.dateValue}>{formattedDate(date, language)}</Text>
          <Text style={s.dateIso}>{date}</Text>
        </View>
        <Icon
          name={showDatePicker ? "chevron-up" : "chevron-down"}
          color={colors.gold}
          size={18}
        />
      </Pressable>
      {showDatePicker ? (
        <View style={s.calendarCard}>
          <DateTimePicker
            value={dateFromIso(date)}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
            themeVariant="dark"
            accentColor={colors.gold}
            onChange={(event, selectedDate) => {
              if (Platform.OS === "android") setShowDatePicker(false);
              if (event.type === "set" && selectedDate) {
                setDate(dateToIso(selectedDate));
              }
            }}
          />
          {Platform.OS === "ios" ? (
            <Pressable
              accessibilityRole="button"
              style={s.calendarDone}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={s.calendarDoneText}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View style={s.timeRow}>
        <View style={{ flex: 1 }}>
          <Field
            label={eventT.startTime}
            value={startTime}
            onChange={setStartTime}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label={eventT.endTime}
            value={endTime}
            onChange={setEndTime}
          />
        </View>
      </View>
      {kind === "padiPuja" ? (
        <>
          <Field
            label={eventT.devoteeName}
            value={devoteeName}
            onChange={setDevoteeName}
          />
          <Field
            label={eventT.familyName}
            value={familyName}
            onChange={setFamilyName}
          />
        </>
      ) : null}
      <Field
        label={kind === "temple" ? eventT.venue : eventT.address}
        value={venue}
        onChange={setVenue}
        multiline={kind === "padiPuja"}
      />
      <Field
        label={eventT.contactName}
        value={contactName}
        onChange={setContactName}
      />
      <Field
        label={eventT.contactPhone}
        value={contactPhone}
        onChange={setContactPhone}
        keyboard="phone-pad"
      />
      <Pressable
        style={s.reminder}
        onPress={() => setRemindersEnabled((current) => !current)}
      >
        <Icon
          name={remindersEnabled ? "notifications" : "notifications-off"}
          color={remindersEnabled ? colors.gold : colors.muted}
        />
        <View style={{ flex: 1 }}>
          <Text style={s.reminderTitle}>{eventT.reminders}</Text>
          <Text style={s.help}>{eventT.reminderHelp}</Text>
        </View>
        <Icon
          name={remindersEnabled ? "checkmark-circle" : "ellipse-outline"}
          color={remindersEnabled ? "#8FBE8D" : colors.muted}
        />
      </Pressable>
      <GoldButton
        label={
          saving
            ? "Saving…"
            : initialEvent
              ? eventT.updateEvent
              : kind === "temple"
              ? eventT.saveEvent
              : eventT.savePadiPuja
        }
        icon="calendar-outline"
        onPress={save}
      />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  keyboard = "default",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  keyboard?: "default" | "phone-pad";
}) {
  return (
    <>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboard}
        placeholderTextColor="#706B5B"
        style={[s.input, multiline && s.multiline]}
      />
    </>
  );
}

const s = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: { color: colors.cream, fontSize: 16, fontWeight: "900" },
  help: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  languageRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  languageChip: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  languageActive: { backgroundColor: colors.gold },
  languageText: { color: colors.cream, fontSize: 11, fontWeight: "800" },
  languageTextActive: { color: colors.ink },
  label: {
    color: "#C4BFAF",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 7,
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.cream,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  dateButton: {
    minHeight: 66,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  dateButtonActive: { borderColor: "rgba(233,185,73,.65)" },
  dateIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(233,185,73,.1)",
  },
  dateValue: { color: colors.cream, fontSize: 13, fontWeight: "800" },
  dateIso: { color: colors.muted, fontSize: 9, marginTop: 3 },
  calendarCard: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#17140E",
    padding: 8,
    overflow: "hidden",
  },
  calendarDone: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  calendarDoneText: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  multiline: { minHeight: 100, paddingTop: 13, textAlignVertical: "top" },
  timeRow: { flexDirection: "row", gap: 10 },
  reminder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#201B11",
    padding: 14,
    marginTop: 18,
    marginBottom: 14,
  },
  reminderTitle: { color: colors.cream, fontSize: 13, fontWeight: "800" },
});
