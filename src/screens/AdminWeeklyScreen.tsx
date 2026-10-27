import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton, GoldButton, Page, ScreenHeader } from "../components/UI";
import { PhotoField } from "../components/EventPhoto";
import {
  DEFAULT_WEEKLY,
  parseTime,
  publishWeeklySchedule,
  useWeeklySchedule,
  WEEKDAYS,
} from "../data/today";
import { pickEventPhoto } from "../services/eventPhoto";
import { deleteEventPhoto, uploadEventPhoto } from "../services/firebase";
import { useApp } from "../state/AppContext";
import type { RootStackParamList, WeekdayKey, WeeklyDay } from "../types";
import { colors } from "../theme";

type Row = WeeklyDay & { localUri?: string };
type Rows = Record<WeekdayKey, Row>;

const EMPTY: Row = { name: "", time: "" };

function toRows(days: Partial<Record<WeekdayKey, WeeklyDay>>): Rows {
  const rows = {} as Rows;
  for (const { key } of WEEKDAYS) rows[key] = { ...EMPTY, ...(days[key] ?? {}) };
  return rows;
}

export default function AdminWeeklyScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "AdminToday">) {
  const { t, isAdmin, cloudConfigured } = useApp();
  const current = useWeeklySchedule();
  const [openTime, setOpenTime] = useState(current.openTime);
  const [closeTime, setCloseTime] = useState(current.closeTime);
  const [rows, setRows] = useState<Rows>(() => toRows(current.days));
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) return;
    setOpenTime(current.openTime);
    setCloseTime(current.closeTime);
    setRows(toRows(current.days));
  }, [current, touched]);

  const patch = (key: WeekdayKey, change: Partial<Row>) => {
    setTouched(true);
    setRows((all) => ({ ...all, [key]: { ...all[key], ...change } }));
  };
  const pickPhoto = async (key: WeekdayKey) => {
    try {
      const uri = await pickEventPhoto();
      if (uri) patch(key, { localUri: uri });
    } catch (reason) {
      Alert.alert("Unable to open photos", reason instanceof Error ? reason.message : "Please try again.");
    }
  };

  const save = async () => {
    if (saving) return;
    const hoursSet = openTime.trim() || closeTime.trim();
    if (hoursSet && (parseTime(openTime) === null || parseTime(closeTime) === null)) {
      return Alert.alert("Check opening hours", "Use a format like 6:00 AM and 9:00 PM.");
    }
    for (const { key, label } of WEEKDAYS) {
      const row = rows[key];
      if (!row.name.trim()) continue;
      if (row.time.trim() && parseTime(row.time) === null) {
        return Alert.alert("Check the timing", `${label}: use a time like 6:30 PM.`);
      }
    }
    setSaving(true);
    try {
      const days: Partial<Record<WeekdayKey, WeeklyDay>> = {};
      for (const { key } of WEEKDAYS) {
        const { localUri, ...row } = rows[key];
        if (!row.name.trim()) continue;
        const day: WeeklyDay = { name: row.name.trim(), time: row.time.trim() };
        if (localUri) {
          const photo = await uploadEventPhoto("today", localUri);
          day.imageUrl = photo.url;
          day.imagePath = photo.path;
        } else if (row.imageUrl) {
          day.imageUrl = row.imageUrl;
          if (row.imagePath) day.imagePath = row.imagePath;
        }
        days[key] = day;
      }
      await publishWeeklySchedule({ openTime: openTime.trim(), closeTime: closeTime.trim(), days });
      const keep = new Set(Object.values(days).map((d) => d.imagePath).filter(Boolean));
      const old = Object.values(current.days).map((d) => d?.imagePath);
      await Promise.all(old.filter((p): p is string => !!p && !keep.has(p)).map((p) => deleteEventPhoto(p)));
      Alert.alert("Published", "Today at the Temple is updated for all devotees.");
      navigation.goBack();
    } catch (reason) {
      Alert.alert("Unable to publish", reason instanceof Error ? reason.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <Page>
        <BackButton navigation={navigation} label={t.admin} />
        <ScreenHeader eyebrow="ADMIN" title="Today at the Temple" subtitle="Sign in as an administrator to edit." />
      </Page>
    );
  }

  return (
    <Page>
      <BackButton navigation={navigation} label={t.admin} />
      <ScreenHeader
        eyebrow="WEEKLY SCHEDULE"
        title="Today at the Temple"
        subtitle="Set the puja for each weekday. The Home page shows the one for the current day. Leave a day's puja name empty if there is no puja."
      />
      {!cloudConfigured ? (
        <Text style={s.warn}>Firebase is not configured. Changes cannot be shared with devotees.</Text>
      ) : null}

      <Text style={s.section}>Temple hours</Text>
      <View style={s.row}>
        <Field label="Opens" value={openTime} onChange={(v) => { setTouched(true); setOpenTime(v); }} placeholder="6:00 AM" />
        <Field label="Closes" value={closeTime} onChange={(v) => { setTouched(true); setCloseTime(v); }} placeholder="9:00 PM" />
      </View>

      <Text style={s.section}>Puja for each day</Text>
      {WEEKDAYS.map(({ key, label }) => {
        const row = rows[key];
        return (
          <View key={key} style={s.day}>
            <Text style={s.dayLabel}>{label}</Text>
            <Field
              label="Puja name"
              value={row.name}
              onChange={(name) => patch(key, { name })}
              placeholder={DEFAULT_WEEKLY.days[key]?.name ?? "No puja"}
            />
            <View style={{ height: 8 }} />
            <Field label="Timing" value={row.time} onChange={(time) => patch(key, { time })} placeholder="6:30 PM" />
            <Text style={[s.label, { marginTop: 10 }]}>Picture</Text>
            <PhotoField
              uri={row.localUri ?? row.imageUrl}
              onPick={() => void pickPhoto(key)}
              onRemove={() => patch(key, { localUri: undefined, imageUrl: undefined, imagePath: undefined })}
            />
          </View>
        );
      })}

      {saving ? (
        <View style={s.saving}>
          <ActivityIndicator color={colors.gold} />
          <Text style={s.savingText}>Publishing…</Text>
        </View>
      ) : (
        <GoldButton label="Publish weekly schedule" onPress={save} />
      )}
    </Page>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={s.input}
      />
    </View>
  );
}

const s = StyleSheet.create({
  warn: { color: colors.red, backgroundColor: colors.redSoft, padding: 12, borderRadius: 12, fontSize: 12, marginBottom: 8 },
  section: { color: colors.text, fontFamily: "serif", fontSize: 17, fontWeight: "700", marginTop: 20, marginBottom: 8 },
  row: { flexDirection: "row", gap: 10 },
  label: { color: colors.muted, fontSize: 11, fontWeight: "700", marginBottom: 6 },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  day: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 12,
  },
  dayLabel: { color: colors.maroon, fontSize: 16, fontWeight: "800", marginBottom: 10 },
  saving: {
    height: 54,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  savingText: { color: colors.text, fontWeight: "800" },
});
