import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton, GoldButton, Icon, Page, ScreenHeader } from "../components/UI";
import { firebaseConfigured, signInDevotee } from "../services/firebase";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

export default function DevoteeLoginScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "DevoteeLogin">) {
  const next = route.params?.next;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  const login = async () => {
    if (!username.trim() || !password) {
      return Alert.alert("Enter your username and password.");
    }
    if (!firebaseConfigured) {
      return Alert.alert("Sign in unavailable", "The temple database is not configured.");
    }
    setBusy(true);
    try {
      await signInDevotee(username, password);
      if (next) navigation.replace(next);
      else navigation.goBack();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "";
      Alert.alert(
        "Unable to sign in",
        /invalid|wrong|not-found|credential/i.test(message)
          ? "Incorrect username or password."
          : message || "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <BackButton navigation={navigation} />
      <ScreenHeader
        eyebrow="DEVOTEE ACCOUNT"
        title="Sign in"
        subtitle="Sign in to book a pooja and manage your sevas."
      />
      <View style={s.card}>
        <Text style={s.label}>Username</Text>
        <View style={s.field}>
          <Icon name="person-outline" size={18} color={colors.muted} />
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            placeholder="Username"
            placeholderTextColor={colors.muted}
            style={s.input}
          />
        </View>
        <Text style={s.label}>Password</Text>
        <View style={s.field}>
          <Icon name="lock-closed-outline" size={18} color={colors.muted} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={hidePassword}
            textContentType="password"
            placeholder="Password"
            placeholderTextColor={colors.muted}
            style={s.input}
            onSubmitEditing={login}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidePassword ? "Show password" : "Hide password"}
            hitSlop={10}
            onPress={() => setHidePassword((v) => !v)}
          >
            <Icon name={hidePassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.muted} />
          </Pressable>
        </View>
        <View style={{ height: 16 }} />
        <GoldButton label={busy ? "Signing in…" : "Sign in"} icon="log-in-outline" onPress={busy ? () => undefined : login} />
      </View>
      <View style={s.signUpRow}>
        <Text style={s.signUpText}>New devotee?</Text>
        <Pressable
          accessibilityRole="link"
          hitSlop={8}
          onPress={() => navigation.navigate("DevoteeSignUp", next ? { next } : undefined)}
        >
          <Text style={s.signUpLink}>Register</Text>
        </Pressable>
      </View>
    </Page>
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
  input: { flex: 1, color: colors.text, fontSize: 15 },
  signUpRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 20 },
  signUpText: { color: colors.muted, fontSize: 14 },
  signUpLink: { color: colors.gold, fontSize: 14, fontWeight: "800", textDecorationLine: "underline" },
});
