import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton, GoldButton, Icon, Page, ScreenHeader } from "../components/UI";
import { createDevoteeAccount, firebaseConfigured } from "../services/firebase";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

export default function DevoteeSignUpScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "DevoteeSignUp">) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!/^[a-zA-Z0-9._-]{3,40}$/.test(username.trim())) {
      return Alert.alert("Check username", "Use 3–40 letters, numbers, dots, underscores or hyphens.");
    }
    if (!firstName.trim() || !lastName.trim()) return Alert.alert("Enter your first and last name.");
    if (password.length < 6) return Alert.alert("Password must be at least 6 characters.");
    if (password !== confirm) return Alert.alert("Passwords do not match.");
    if (phone.replace(/\D/g, "").length < 10) return Alert.alert("Enter a valid phone number.");
    if (!firebaseConfigured) return Alert.alert("Unavailable", "The temple database is not configured.");
    setBusy(true);
    try {
      await createDevoteeAccount({ username, firstName, lastName, password, address, phone });
      Alert.alert("Account created", "Please sign in with your new username and password.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (reason) {
      Alert.alert("Unable to create account", reason instanceof Error ? reason.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <BackButton navigation={navigation} label="Sign in" />
      <ScreenHeader eyebrow="DEVOTEE ACCOUNT" title="Create account" />
      <View style={s.card}>
        <Field label="Desired username *" icon="at-outline" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} textContentType="username" />
        <Field label="First name *" icon="person-outline" value={firstName} onChangeText={setFirstName} textContentType="givenName" />
        <Field label="Last name *" icon="person-outline" value={lastName} onChangeText={setLastName} textContentType="familyName" />
        <Field label="Password *" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" />
        <Field label="Retype password *" icon="lock-closed-outline" value={confirm} onChangeText={setConfirm} secureTextEntry textContentType="newPassword" />
        <Field label="Address (optional)" icon="home-outline" value={address} onChangeText={setAddress} multiline textContentType="fullStreetAddress" />
        <Field label="Phone number *" icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" textContentType="telephoneNumber" />
        <View style={{ height: 18 }} />
        <GoldButton label={busy ? "Saving…" : "Save"} icon="checkmark-circle-outline" onPress={busy ? () => undefined : save} />
      </View>
    </Page>
  );
}

function Field({
  label,
  icon,
  secureTextEntry,
  ...input
}: TextInputProps & { label: string; icon: React.ComponentProps<typeof Icon>["name"] }) {
  const [hidden, setHidden] = useState(true);
  return (
    <>
      <Text style={s.label}>{label}</Text>
      <View style={s.field}>
        <Icon name={icon} size={18} color={colors.muted} />
        <TextInput
          placeholderTextColor={colors.muted}
          style={s.input}
          secureTextEntry={secureTextEntry && hidden}
          {...input}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            hitSlop={10}
            onPress={() => setHidden((v) => !v)}
          >
            <Icon name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  label: { color: colors.muted, fontSize: 11, fontWeight: "700", marginBottom: 6, marginTop: 10 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
  },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 10 },
});
