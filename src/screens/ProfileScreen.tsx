import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon, Page, ScreenHeader } from "../components/UI";
import { languages } from "../data/content";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

export default function ProfileScreen() {
  const {
    t,
    language,
    setLanguage,
    registered,
    isAdmin,
    leaveAdmin,
    replayWelcome,
  } = useApp();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Page>
      <ScreenHeader
        eyebrow={t.account}
        title={registered ? t.registered : t.register}
      />
      <View style={s.hero}>
        <View style={s.avatar}>
          <Icon name="person" color={colors.gold} size={28} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.heroTitle}>
            {registered ? "Temple devotee" : "Join our devotee family"}
          </Text>
          <Text style={s.meta}>Receive important temple announcements.</Text>
        </View>
      </View>
      {!registered && (
        <Pressable
          style={s.primary}
          onPress={() => navigation.navigate("Registration")}
        >
          <Icon name="person-add" color={colors.ink} />
          <Text style={s.primaryText}>{t.register}</Text>
        </Pressable>
      )}
      <Text style={s.section}>{t.language}</Text>
      <View style={s.grid}>
        {languages.map((item) => {
          const active = item.id === language;
          return (
            <Pressable
              key={item.id}
              onPress={() => setLanguage(item.id)}
              style={[s.language, active && s.active]}
            >
              <Text style={[s.native, active && { color: colors.ink }]}>
                {item.native}
              </Text>
              <Text style={[s.meta, active && { color: "#6B4A0D" }]}>
                {item.label}
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
        <Pressable onPress={leaveAdmin}>
          <Text style={s.signout}>{t.signout}</Text>
        </Pressable>
      )}
    </Page>
  );
}
const s = StyleSheet.create({
  hero: {
    backgroundColor: "#201B11",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 17,
    flexDirection: "row",
    gap: 13,
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(233,185,73,.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { color: colors.cream, fontSize: 15, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  primary: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.gold,
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  primaryText: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  section: {
    color: colors.cream,
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
  active: { backgroundColor: colors.gold },
  native: { color: colors.cream, fontSize: 15, fontWeight: "800" },
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
  signout: { color: "#CB7770", textAlign: "center", marginTop: 18 },
});
