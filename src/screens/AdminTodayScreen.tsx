import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton, GoldButton, Icon, Page, ScreenHeader } from "../components/UI";
import {
  deities,
  parseTime,
  publishTodaySchedule,
  todayIso,
  useTodaySchedule,
} from "../data/today";
import { useApp } from "../state/AppContext";
import type { DeityKey, RootStackParamList, ScheduleItem } from "../types";
import { colors } from "../theme";

export default function AdminTodayScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "AdminToday">) {
  const { t, isAdmin, cloudConfigured } = useApp();
  const current = useTodaySchedule();
  const [openTime, setOpenTime] = useState(current.openTime);
  const [closeTime, setCloseTime] = useState(current.closeTime);
  const [deity, setDeity] = useState<DeityKey>(current.deity);
  const [items, setItems] = useState<ScheduleItem[]>(current.items);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  // Load the latest saved schedule once it arrives, unless the admin already started editing.
  useEffect(() => {
    if (touched) return;
    setOpenTime(current.openTime);
    setCloseTime(current.closeTime);
    setDeity(current.deity);
    setItems(current.items);
  }, [current, touched]);

  const edit = <T,>(setter: (v: T) => void) => (value: T) => {
    setTouched(true);
    setter(value);
  };
  const updateItem = (index: number, patch: Partial<ScheduleItem>) => {
    setTouched(true);
    setItems((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };
  const removeItem = (index: number) => {
    setTouched(true);
    setItems((list) => list.filter((_, i) => i !== index));
  };
  const addItem = () => {
    setTouched(true);
    setItems((list) => [...list, { time: "", name: "" }]);
  };

  const save = async () => {
    const cleaned = items
      .map((item) => ({ time: item.time.trim(), name: item.name.trim() }))
      .filter((item) => item.time || item.name);
    if (parseTime(openTime) === null || parseTime(closeTime) === null) {
      return Alert.alert("Check opening hours", "Use a format like 6:00 AM and 9:00 PM.");
    }
    const bad = cleaned.find((item) => !item.name || parseTime(item.time) === null);
    if (bad) {
      return Alert.alert("Check the schedule", "Each row needs a time like 6:30 PM and a pooja name.");
    }
    if (!cleaned.length) return Alert.alert("Add at least one pooja to the schedule.");
    cleaned.sort((a, b) => (parseTime(a.time) ?? 0) - (parseTime(b.time) ?? 0));
    setSaving(true);
    try {
      await publishTodaySchedule({
        date: todayIso(),
        openTime: openTime.trim(),
        closeTime: closeTime.trim(),
        deity,
        items: cleaned,
      });
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
        eyebrow="DAILY DETAILS"
        title="Today at the Temple"
        subtitle="Set today's hours, the deity for the day, and the pooja schedule shown on the Home page."
      />
      {!cloudConfigured ? (
        <Text style={s.warn}>Firebase is not configured. Changes cannot be shared with devotees.</Text>
      ) : null}

      <Text style={s.section}>Temple hours</Text>
      <View style={s.row}>
        <Field label="Opens" value={openTime} onChange={edit(setOpenTime)} placeholder="6:00 AM" />
        <Field label="Closes" value={closeTime} onChange={edit(setCloseTime)} placeholder="9:00 PM" />
      </View>

      <Text style={s.section}>Deity of the day</Text>
      <Text style={s.note}>The Home page image changes to the selected deity.</Text>
      <View style={s.deityGrid}>
        {deities.map((option) => {
          const active = option.key === deity;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => edit(setDeity)(option.key)}
              style={[s.deity, active && s.deityActive]}
            >
              <Image source={option.image} style={s.deityImage} />
              <Text style={[s.deityLabel, active && s.deityLabelActive]} numberOfLines={1}>
                {option.label}
              </Text>
              {active ? (
                <View style={s.check}>
                  <Icon name="checkmark" size={14} color={colors.ink} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Text style={s.section}>Pooja schedule</Text>
      {items.map((item, index) => (
        <View key={index} style={s.itemRow}>
          <TextInput
            value={item.time}
            onChangeText={(time) => updateItem(index, { time })}
            placeholder="6:00 AM"
            placeholderTextColor={colors.muted}
            style={[s.input, s.timeInput]}
          />
          <TextInput
            value={item.name}
            onChangeText={(name) => updateItem(index, { name })}
            placeholder="Pooja name"
            placeholderTextColor={colors.muted}
            style={[s.input, { flex: 1 }]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove row"
            hitSlop={8}
            onPress={() => removeItem(index)}
            style={s.remove}
          >
            <Icon name="trash-outline" size={18} color={colors.red} />
          </Pressable>
        </View>
      ))}
      <Pressable onPress={addItem} style={s.add}>
        <Icon name="add-circle-outline" size={20} color={colors.gold} />
        <Text style={s.addText}>Add pooja</Text>
      </Pressable>

      <GoldButton
        label={saving ? "Publishing…" : "Publish today's details"}
        icon="cloud-upload"
        onPress={saving ? () => undefined : save}
      />
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
  note: { color: colors.muted, fontSize: 12, marginBottom: 10 },
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
  deityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  deity: {
    width: "31%",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  deityActive: { borderColor: colors.goldFill, borderWidth: 2.5 },
  deityImage: { width: "100%", height: 80 },
  deityLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", textAlign: "center", paddingVertical: 7 },
  deityLabelActive: { color: colors.text },
  check: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.goldFill,
    alignItems: "center",
    justifyContent: "center",
  },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  timeInput: { width: 96 },
  remove: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.redSoft, alignItems: "center", justifyContent: "center" },
  add: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, marginBottom: 18 },
  addText: { color: colors.gold, fontWeight: "800", fontSize: 13 },
});
