import React from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];
export function Icon({
  name,
  size = 22,
  color = colors.cream,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
export function GoldButton({
  label,
  icon,
  onPress,
  secondary,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        pressed && { opacity: 0.72 },
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={18}
          color={secondary ? colors.gold : colors.ink}
        />
      )}
      <Text style={[s.buttonText, secondary && { color: colors.gold }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={s.header}>
      {eyebrow ? <Text style={s.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
      <Text style={s.title}>{title}</Text>
      <View style={s.rule} />
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}
export function Page({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const content = (
    <SafeAreaView style={s.safe}>
      <View style={s.page}>{children}</View>
    </SafeAreaView>
  );
  return scroll ? (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  ) : (
    <View style={s.root}>{content}</View>
  );
}
export function BackButton({
  navigation,
  label = "Back",
}: {
  navigation: { goBack: () => void };
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={12}
      style={s.back}
      onPress={() => navigation.goBack()}
    >
      <Icon name="chevron-back" size={25} color={colors.gold} />
      <Text style={s.backText}>{label}</Text>
    </Pressable>
  );
}
export function Card({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && { opacity: 0.74 }]}
    >
      {children}
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  scroll: { paddingBottom: 115 },
  safe: { flex: 1 },
  page: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 34 : 12,
  },
  header: { marginBottom: 20 },
  eyebrow: {
    color: colors.gold,
    fontSize: 9,
    letterSpacing: 2.2,
    fontWeight: "900",
  },
  title: {
    color: colors.cream,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "900",
    marginTop: 8,
  },
  rule: {
    width: 38,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginTop: 15,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 15,
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.gold,
    paddingHorizontal: 18,
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(233,185,73,.42)",
  },
  buttonText: { color: colors.ink, fontWeight: "900", fontSize: 13 },
  back: {
    minHeight: 54,
    minWidth: 124,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: "rgba(233,185,73,.1)",
    borderWidth: 1,
    borderColor: "rgba(233,185,73,.24)",
  },
  backText: { color: colors.gold, fontSize: 13, fontWeight: "800" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
});
