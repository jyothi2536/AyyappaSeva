import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon, Page, ScreenHeader } from "../components/UI";
import { signOutToHome } from "../navigation/adminLogout";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

export default function ProfileScreen() {
  const {
    t,
    isAdmin,
    leaveAdmin,
    replayWelcome,
    themeMode,
    setThemeMode,
  } = useApp();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Page>
      <ScreenHeader eyebrow={t.account} title={t.profile} />
      <Text style={s.section}>Theme</Text>
      <View style={s.themeRow}>
        {(
          [
            { mode: "light", label: "Light", icon: "sunny" },
            { mode: "dark", label: "Dark", icon: "moon" },
          ] as const
        ).map((option) => {
          const active = themeMode === option.mode;
          return (
            <Pressable
              key={option.mode}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => setThemeMode(option.mode)}
              style={[s.themeOption, active && s.themeOptionActive]}
            >
              <Icon
                name={active ? option.icon : `${option.icon}-outline`}
                size={20}
                color={active ? colors.ink : colors.gold}
              />
              <Text style={[s.themeLabel, active && s.themeLabelActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={s.outline} onPress={replayWelcome}>
        <Icon name="refresh" color={colors.gold} />
        <Text style={s.outlineText}>{t.welcomeAgain}</Text>
      </Pressable>
      <Text style={s.section}>{t.admin}</Text>
      <Pressable style={s.admin} onPress={() => navigation.navigate("Admin")}>
        <View style={s.adminIcon}>
          <Icon name="shield-checkmark" color={colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.heroTitle}>{t.admin}</Text>
          <Text style={s.meta}>{t.adminSub}</Text>
        </View>
        <Icon name="chevron-forward" color={colors.gold} />
      </Pressable>
      {isAdmin && (
        <Pressable onPress={() => void signOutToHome(leaveAdmin, navigation)}>
          <Text style={s.signout}>{t.signout}</Text>
        </Pressable>
      )}
    </Page>
  );
}
const s = StyleSheet.create({
  themeRow: { flexDirection: "row", gap: 10 },
  themeOption: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  themeOptionActive: { backgroundColor: colors.goldFill, borderColor: colors.goldFill },
  themeLabel: { color: colors.text, fontSize: 14, fontWeight: "700" },
  themeLabelActive: { color: colors.ink },
  heroTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  section: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 26,
    marginBottom: 12,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  language: {
    width: "48.5%",
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.line,
  },
  active: { backgroundColor: colors.goldFill },
  native: { color: colors.text, fontSize: 15, fontWeight: "800" },
  outline: {
    marginTop: 12,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineText: { color: colors.gold, fontSize: 11, fontWeight: "800" },
  admin: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adminIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "rgba(233,185,73,.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  signout: { color: colors.muted, textAlign: "center", marginTop: 18 },
});
