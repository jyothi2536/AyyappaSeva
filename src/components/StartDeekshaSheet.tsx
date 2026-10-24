import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Icon } from "./UI";
import { colors, pickerTheme } from "../theme";
import { DEEKSHA_DAYS, deekshaLength, parseDay, toDay } from "../services/deeksha";

const fmt = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });

const addDays = (d: Date, n: number) => {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
};

/** Lets the devotee pick the Deeksha start and end (Irumudi) dates. */
export default function StartDeekshaSheet({
  visible,
  onClose,
  onStart,
  initial,
}: {
  visible: boolean;
  onClose: () => void;
  onStart: (startIso: string, endIso: string, name: string) => void;
  /** When set, the sheet edits an existing Deeksha instead of starting one. */
  initial?: { name: string; start: string; end: string };
}) {
  const [name, setName] = useState("");
  const [start, setStart] = useState(() => new Date());
  const [end, setEnd] = useState(() => addDays(new Date(), DEEKSHA_DAYS - 1));
  const [picker, setPicker] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    if (!visible) return;
    setPicker(null);
    if (initial) {
      setName(initial.name);
      setStart(parseDay(initial.start));
      setEnd(parseDay(initial.end));
      return;
    }
    const today = new Date();
    setName("");
    setStart(today);
    setEnd(addDays(today, DEEKSHA_DAYS - 1));
    setPicker(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const changeStart = (d: Date) => {
    // Keep the same length when the start moves; default is 41 days.
    const length = deekshaLength(toDay(start), toDay(end));
    setStart(d);
    setEnd(addDays(d, length - 1));
  };

  const days = deekshaLength(toDay(start), toDay(end));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.head}>
            <Text style={s.title}>{initial ? "Edit Deeksha" : "Start Deeksha"}</Text>
            <Pressable hitSlop={10} onPress={onClose} accessibilityLabel="Close">
              <Icon name="close" color={colors.muted} size={24} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ gap: 12 }} keyboardShouldPersistTaps="handled">
            <View style={s.row}>
              <Icon name="person-outline" color={colors.maroon} size={22} />
              <View style={{ flex: 1 }}>
                <Text style={s.rowLabel}>Devotee name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onFocus={() => setPicker(null)}
                  style={[s.rowValue, s.input]}
                />
              </View>
            </View>
            <DateRow
              label="Deeksha start date"
              icon="sunny-outline"
              value={fmt(start)}
              active={picker === "start"}
              onPress={() => setPicker(picker === "start" ? null : "start")}
            />
            {picker === "start" ? (
              <DateTimePicker
                value={start}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "calendar"}
                themeVariant={pickerTheme()}
                accentColor={colors.maroon}
                onChange={(_, d) => {
                  if (Platform.OS === "android") setPicker(null);
                  if (d) changeStart(d);
                }}
              />
            ) : null}
            <DateRow
              label="Deeksha end date (Irumudi)"
              icon="flag-outline"
              value={fmt(end)}
              active={picker === "end"}
              onPress={() => setPicker(picker === "end" ? null : "end")}
            />
            {picker === "end" ? (
              <DateTimePicker
                value={end}
                mode="date"
                minimumDate={start}
                display={Platform.OS === "ios" ? "inline" : "calendar"}
                themeVariant={pickerTheme()}
                accentColor={colors.maroon}
                onChange={(_, d) => {
                  if (Platform.OS === "android") setPicker(null);
                  if (d) setEnd(d < start ? start : d);
                }}
              />
            ) : null}
            <Text style={s.length}>
              {days} day{days === 1 ? "" : "s"} of Deeksha
              {days === DEEKSHA_DAYS ? " · Mandala" : ""}
            </Text>
            <Pressable style={s.startBtn} onPress={() => onStart(toDay(start), toDay(end), name.trim())}>
              <Text style={s.startText}>{initial ? "SAVE CHANGES" : "START DEEKSHA"}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function DateRow({
  label,
  icon,
  value,
  active,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  value: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.row, active && s.rowActive]}>
      <Icon name={icon} color={colors.maroon} size={22} />
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowValue}>{value}</Text>
      </View>
      <Icon name="calendar-outline" color={colors.gold} size={20} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: 34,
    maxHeight: "90%",
  },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { color: colors.maroon, fontSize: 20, fontWeight: "800" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  rowActive: { borderColor: colors.goldFill },
  rowLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  rowValue: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 2 },
  input: { padding: 0 },
  length: { color: colors.gold, fontSize: 13, fontWeight: "800", textAlign: "center" },
  startBtn: {
    backgroundColor: "#7A1426",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  startText: { color: colors.cream, fontWeight: "900", letterSpacing: 1, fontSize: 14 },
});
