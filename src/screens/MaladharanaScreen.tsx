import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon, Page } from "../components/UI";
import { RegistrationTrail } from "../components/RegistrationTrail";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";
import { saveMaladharanaRegistration, toDay } from "../services/deeksha";

// UI only — nothing is saved or sent yet.

const MEMBER_TYPES = ["Adult", "Child"] as const;
type MemberType = (typeof MEMBER_TYPES)[number];

type Devotee = { key: number; name: string; type: MemberType; date: Date | null };

export const BASE_FEE = 21;
/** Irumudi sponsorship per devotee. */
export const IRUMUDI_FEE = 75;
export type RegistrationKind = "maladharana" | "irumudi";
export const ITEMS = [
  { id: "mala", label: "2 Copper Mala", price: 35 },
  { id: "dhothi", label: "1 Dhothi & 1 Towel", price: 35 },
  {
    id: "set",
    label: "Deeksha Set",
    note: "2 Copper Mala, 2 Dhothi, 2 Towel & 1 T-Shirt",
    price: 116,
  },
  { id: "tshirt", label: "1 T-shirt", price: 25 },
] as const;
export type ItemId = (typeof ITEMS)[number]["id"];

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function MaladharanaScreen() {
  return <RegistrationForm kind="maladharana" />;
}

/** Shared registration form for Maladharana and Irumudi. */
export function RegistrationForm({ kind }: { kind: RegistrationKind }) {
  const isIrumudi = kind === "irumudi";
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [devotees, setDevotees] = useState<Devotee[]>([
    { key: 1, name: "", type: "Adult", date: null },
  ]);
  const [needItems, setNeedItems] = useState<boolean | null>(null);
  const [qty, setQty] = useState<Record<ItemId, number>>({
    mala: 0,
    dhothi: 0,
    set: 0,
    tshirt: 0,
  });
  const [picker, setPicker] = useState<{ key: number; kind: "date" | "type" } | null>(null);

  const setField = (field: keyof typeof contact) => (value: string) =>
    setContact((c) => ({ ...c, [field]: value }));
  const updateDevotee = (key: number, patch: Partial<Devotee>) =>
    setDevotees((list) => list.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  const addDevotee = () =>
    setDevotees((list) => [
      ...list,
      { key: (list.at(-1)?.key ?? 0) + 1, name: "", type: "Adult", date: null },
    ]);
  const removeDevotee = (key: number) =>
    setDevotees((list) => list.filter((d) => d.key !== key));
  const changeQty = (id: ItemId, delta: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(20, q[id] + delta)) }));

  const itemsTotal = needItems
    ? ITEMS.reduce((sum, item) => sum + item.price * qty[item.id], 0)
    : 0;
  const total = isIrumudi
    ? IRUMUDI_FEE * devotees.length
    : needItems === false
      ? BASE_FEE * devotees.length
      : itemsTotal;

  const register = () => {
    const missing: string[] = [];
    if (!contact.name.trim()) missing.push("Name");
    if (!contact.phone.trim()) missing.push("Phone");
    if (!contact.email.trim()) missing.push("Email");
    if (devotees.some((d) => !d.name.trim() || !d.date)) missing.push("Devotee name and date");
    if (!isIrumudi && needItems === null) missing.push("Mala items (Yes / No)");
    if (missing.length) {
      Alert.alert("Please complete", missing.join("\n"));
      return;
    }
    // Track the Maladharana registration; the first devotee's date is Deeksha Day 1.
    const firstDate = devotees[0]?.date;
    if (!isIrumudi && firstDate) {
      void saveMaladharanaRegistration(
        {
          contact: { name: contact.name.trim(), phone: contact.phone.trim(), email: contact.email.trim() },
          devotees: devotees.map((d) => ({ name: d.name.trim(), type: d.type, date: toDay(d.date!) })),
          registeredAt: new Date().toISOString(),
        },
        toDay(firstDate),
      );
    }
    navigation.navigate("MaladharanaReview", {
      kind,
      contact,
      devotees: devotees.map((d) => ({
        name: d.name.trim(),
        type: d.type,
        date: d.date!.toISOString(),
      })),
      needItems: needItems === true,
      qty,
      total,
    });
  };

  return (
    <Page>
      <RegistrationTrail kind={kind} step="details" navigation={navigation} />

      {/* Contact */}
      <SectionTitle text="General Contact Details" />
      <Field placeholder="Full name" value={contact.name} onChangeText={setField("name")} />
      <View style={s.row}>
        <Field half placeholder="Phone" keyboardType="phone-pad" value={contact.phone} onChangeText={setField("phone")} />
        <Field half placeholder="Email" keyboardType="email-address" value={contact.email} onChangeText={setField("email")} />
      </View>
      <View style={s.row}>
        <Field half placeholder="Street address" value={contact.address} onChangeText={setField("address")} />
        <Field half placeholder="City" value={contact.city} onChangeText={setField("city")} />
      </View>
      <View style={s.row}>
        <Field half placeholder="State" autoCapitalize="characters" value={contact.state} onChangeText={setField("state")} />
        <Field half placeholder="ZIP code" keyboardType="number-pad" value={contact.zip} onChangeText={setField("zip")} />
      </View>

      {/* Devotees */}
      <SectionTitle text={isIrumudi ? "Irumudi Details" : "Maladharana Details"} />
      {devotees.map((d, index) => {
        const typeOpen = picker?.key === d.key && picker.kind === "type";
        const dateOpen = picker?.key === d.key && picker.kind === "date";
        return (
          <View key={d.key} style={s.devotee}>
            <View style={s.devoteeHead}>
              <Text style={s.devoteeTitle}>Devotee {index + 1}</Text>
              {devotees.length > 1 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove devotee ${index + 1}`}
                  hitSlop={8}
                  onPress={() => removeDevotee(d.key)}
                >
                  <Icon name="trash-outline" size={18} color={colors.red} />
                </Pressable>
              ) : null}
            </View>
            <Label text="Devotee Name" />
            <Field
              placeholder="Name"
              value={d.name}
              onChangeText={(name) => updateDevotee(d.key, { name })}
            />
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Label text="Member Type" />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPicker(typeOpen ? null : { key: d.key, kind: "type" })}
                  style={[s.input, s.select]}
                >
                  <Text style={s.selectText}>{d.type}</Text>
                  <Icon name={typeOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.muted} />
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <Label text="Date" />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPicker(dateOpen ? null : { key: d.key, kind: "date" })}
                  style={[s.input, s.select]}
                >
                  <Text style={[s.selectText, !d.date && { color: colors.muted }]}>
                    {d.date ? formatDate(d.date) : "Select date"}
                  </Text>
                  <Icon name="calendar-outline" size={16} color={colors.muted} />
                </Pressable>
              </View>
            </View>
            {typeOpen ? (
              <View style={s.options}>
                {MEMBER_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => {
                      updateDevotee(d.key, { type });
                      setPicker(null);
                    }}
                    style={[s.option, d.type === type && s.optionActive]}
                  >
                    <Text style={[s.optionText, d.type === type && s.optionTextActive]}>{type}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {dateOpen ? (
              <View style={s.calendar}>
                <DateTimePicker
                  value={d.date ?? new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "calendar"}
                  minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
                  accentColor={colors.maroon}
                  onChange={(event, selected) => {
                    if (Platform.OS === "android") setPicker(null);
                    if (event.type === "set" && selected) updateDevotee(d.key, { date: selected });
                  }}
                />
                {Platform.OS === "ios" ? (
                  <Pressable style={s.done} onPress={() => setPicker(null)}>
                    <Text style={s.doneText}>Done</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
      <Pressable
        accessibilityRole="button"
        onPress={addDevotee}
        style={({ pressed }) => [s.addButton, pressed && { opacity: 0.8 }]}
      >
        <Icon name="add" size={18} color="#fff" />
        <Text style={s.addText}>ADD MORE DEVOTEE</Text>
      </Pressable>

      {isIrumudi ? (
        <View style={s.sponsor}>
          <Icon name="gift-outline" size={20} color={colors.maroon} />
          <Text style={s.sponsorText}>Sponsorship for Irumudi</Text>
          <Text style={s.sponsorPrice}>${IRUMUDI_FEE}</Text>
        </View>
      ) : null}

      {/* Mala items */}
      {!isIrumudi ? (<>
      <Text style={s.question}>
        Do you need Mala items (Yes / No)? If No, pay only ${BASE_FEE} for Maladharana.
        <Text style={{ color: colors.red }}> *</Text>
      </Text>
      <View style={s.radios}>
        {[true, false].map((value) => (
          <Pressable
            key={String(value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: needItems === value }}
            onPress={() => setNeedItems(value)}
            style={s.radio}
          >
            <View style={[s.radioOuter, needItems === value && s.radioOuterOn]}>
              {needItems === value ? <View style={s.radioInner} /> : null}
            </View>
            <Text style={s.radioText}>{value ? "Yes" : "No"}</Text>
          </Pressable>
        ))}
      </View>

      {needItems ? (
        <View style={s.items}>
          {ITEMS.map((item, i) => (
            <View key={item.id} style={[s.item, i > 0 && s.itemBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemLabel}>
                  {item.label} – ${item.price}
                </Text>
                {"note" in item ? <Text style={s.itemNote}>({item.note})</Text> : null}
              </View>
              <View style={s.stepper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Fewer ${item.label}`}
                  onPress={() => changeQty(item.id, -1)}
                  style={s.stepBtn}
                >
                  <Icon name="remove" size={16} color={colors.maroon} />
                </Pressable>
                <Text style={s.qty}>{qty[item.id]}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`More ${item.label}`}
                  onPress={() => changeQty(item.id, 1)}
                  style={s.stepBtn}
                >
                  <Icon name="add" size={16} color={colors.maroon} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ) : null}
      </>) : null}

      {isIrumudi || needItems !== null ? (
        <View style={s.total}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>${total}</Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={register}
        style={({ pressed }) => [s.submit, pressed && { opacity: 0.85 }]}
      >
        <Text style={s.submitText}>REGISTER</Text>
      </Pressable>
    </Page>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <Text style={s.section}>
      {text}
      <Text style={{ color: colors.red }}> *</Text>
    </Text>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={s.label}>{text}</Text>;
}

function Field({
  half,
  ...props
}: {
  half?: boolean;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <TextInput
      {...props}
      autoCapitalize={
        props.autoCapitalize ?? (props.keyboardType === "email-address" ? "none" : "words")
      }
      autoCorrect={false}
      placeholderTextColor={colors.muted}
      style={[s.input, half && { flex: 1 }]}
    />
  );
}

const s = StyleSheet.create({
  section: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 18, marginBottom: 10 },
  label: { color: colors.text, fontSize: 13, fontWeight: "600", marginBottom: 6 },
  row: { flexDirection: "row", gap: 10 },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 14,
    marginBottom: 10,
  },
  select: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectText: { color: colors.text, fontSize: 14, flexShrink: 1 },
  devotee: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.raised,
  },
  devoteeHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  devoteeTitle: { color: colors.maroon, fontWeight: "700", fontSize: 14 },
  options: { flexDirection: "row", gap: 8, marginBottom: 10 },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  optionActive: { backgroundColor: "#7A1426", borderColor: "#7A1426" },
  optionText: { color: colors.text, fontWeight: "600" },
  optionTextActive: { color: "#fff" },
  calendar: { backgroundColor: colors.surface, borderRadius: 12, padding: 6, marginBottom: 10 },
  done: { alignSelf: "flex-end", paddingHorizontal: 14, paddingVertical: 8 },
  doneText: { color: colors.maroon, fontWeight: "700" },
  addButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7A1426",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 4,
  },
  addText: { color: "#fff", fontWeight: "800", fontSize: 13, letterSpacing: 0.3 },
  question: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 20 },
  radios: { flexDirection: "row", gap: 24, marginTop: 10, marginBottom: 6 },
  radio: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterOn: { borderColor: "#2F6FD1" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2F6FD1" },
  radioText: { color: colors.text, fontSize: 15 },
  items: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  itemLabel: { color: colors.text, fontSize: 14, fontWeight: "600" },
  itemNote: { color: colors.muted, fontSize: 12, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.raised,
  },
  qty: { minWidth: 26, textAlign: "center", color: colors.text, fontSize: 15, fontWeight: "700" },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.maroonSoft,
  },
  totalLabel: { color: colors.text, fontSize: 15, fontWeight: "700" },
  totalValue: { color: colors.maroon, fontSize: 18, fontWeight: "800" },
  sponsor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  sponsorText: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "600" },
  sponsorPrice: { color: colors.maroon, fontSize: 16, fontWeight: "800" },
  submit: {
    marginTop: 18,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#7A1426",
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.5 },
});
