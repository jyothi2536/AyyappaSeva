import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton, GoldButton, Page, ScreenHeader } from "../components/UI";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

export default function RegistrationScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Registration">) {
  const { t, register } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const save = () => {
    if (!name.trim() || !phone.trim())
      return Alert.alert("Please add your name and mobile number.");
    register();
    navigation.goBack();
  };
  return (
    <Page>
      <BackButton navigation={navigation} label={t.profile} />
      <ScreenHeader
        eyebrow={t.account}
        title={t.register}
        subtitle="Receive event announcements, pooja reminders, and community updates."
      />
      <Field label={t.fullName} value={name} onChange={setName} />
      <Field
        label={t.phone}
        value={phone}
        onChange={setPhone}
        keyboard="phone-pad"
      />
      <Field
        label={t.email}
        value={email}
        onChange={setEmail}
        keyboard="email-address"
      />
      <Field label={t.city} value={city} onChange={setCity} />
      <GoldButton label={t.save} icon="checkmark-circle" onPress={save} />
    </Page>
  );
}
function Field({
  label,
  value,
  onChange,
  keyboard = "default",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboard?: "default" | "phone-pad" | "email-address";
}) {
  return (
    <>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        style={s.input}
      />
    </>
  );
}
const s = StyleSheet.create({
  label: { color: "#C4BFAF", fontSize: 11, fontWeight: "700", marginBottom: 7 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.cream,
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 15,
  },
});
