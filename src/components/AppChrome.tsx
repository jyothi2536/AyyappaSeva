import React, { useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TEMPLE } from "../data/content";
import { useApp } from "../state/AppContext";
import type { TabParamList } from "../types";
import { colors } from "../theme";
import { Icon } from "./UI";

export type AppTab = keyof TabParamList;

const tabs: AppTab[] = ["Home", "Temple", "Updates", "Deeksha", "Songs", "Profile"];
type IonGlyph = React.ComponentProps<typeof Icon>["name"];
type McGlyph = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
type TabIcon =
  | { set: "ion"; active: IonGlyph; inactive: IonGlyph }
  | { set: "mci"; active: McGlyph; inactive: McGlyph };
const icons: Record<AppTab, TabIcon> = {
  Home: { set: "ion", active: "home", inactive: "home-outline" },
  Songs: { set: "ion", active: "book", inactive: "book-outline" },
  Updates: { set: "mci", active: "spa", inactive: "spa-outline" },
  Temple: { set: "mci", active: "temple-hindu", inactive: "temple-hindu-outline" },
  Deeksha: { set: "mci", active: "necklace", inactive: "necklace" },
  Profile: { set: "ion", active: "person", inactive: "person-outline" },
};

export type MenuTarget =
  | { tab: AppTab }
  | {
      route:
        | "BookPooja"
        | "ContactTemple"
        | "Wallpapers"
        | "Scriptures"
        | "Downloads"
        | "Harivarasanam"
        | "Admin";
    };

type MenuItem = {
  label: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  target: MenuTarget;
};

const menuItems: MenuItem[] = [
  { label: "Home", icon: "home-outline", target: { tab: "Home" } },
  { label: "About Our Temple", icon: "business-outline", target: { tab: "Temple" } },
  { label: "Pooja Services", icon: "flower-outline", target: { tab: "Updates" } },
  { label: "Book a Pooja", icon: "calendar-outline", target: { route: "BookPooja" } },
  { label: "Deeksha", icon: "ellipse-outline", target: { tab: "Deeksha" } },
  { label: "Resources", icon: "book-outline", target: { tab: "Songs" } },
  { label: "Harivarasanam", icon: "musical-notes-outline", target: { route: "Harivarasanam" } },
  { label: "Scriptures", icon: "library-outline", target: { route: "Scriptures" } },
  { label: "Wallpapers", icon: "images-outline", target: { route: "Wallpapers" } },
  { label: "Downloads", icon: "download-outline", target: { route: "Downloads" } },
  { label: "Contact & Location", icon: "location-outline", target: { route: "ContactTemple" } },
  { label: "Profile", icon: "person-outline", target: { tab: "Profile" } },
  { label: "Admin", icon: "shield-checkmark-outline", target: { route: "Admin" } },
];

export function AppHeader({
  onUpdates,
  onMenuNavigate,
}: {
  onUpdates: () => void;
  onMenuNavigate?: (target: MenuTarget) => void;
}) {
  const [open, setOpen] = useState(false);
  const select = (target: MenuTarget) => {
    setOpen(false);
    if (onMenuNavigate) onMenuNavigate(target);
    else if ("tab" in target && target.tab === "Updates") onUpdates();
  };
  return (
    <SafeAreaView edges={["top"]} style={s.topSafeArea}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={s.brand} numberOfLines={1} adjustsFontSizeToFit>
            {TEMPLE.name}
          </Text>
          <Text style={s.tagline} numberOfLines={1} adjustsFontSizeToFit>
            SWAMIYE SARANAM AYYAPPA
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Temple updates"
          hitSlop={10}
          onPress={onUpdates}
          style={({ pressed }) => [s.headerAction, pressed && s.pressed]}
        >
          <Icon name="notifications-outline" color={colors.cream} size={22} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={10}
          onPress={() => setOpen(true)}
          style={({ pressed }) => [s.headerAction, pressed && s.pressed]}
        >
          <Icon name="menu" color={colors.cream} size={26} />
        </Pressable>
      </View>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={s.menuRoot}>
          <Pressable style={s.menuBackdrop} onPress={() => setOpen(false)} />
          <SafeAreaView edges={["top", "bottom"]} style={s.menuPanel}>
            <View style={s.menuHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.brand}>{TEMPLE.name}</Text>
                <Text style={s.tagline}>MENU</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                hitSlop={10}
                onPress={() => setOpen(false)}
                style={({ pressed }) => [s.headerAction, pressed && s.pressed]}
              >
                <Icon name="close" color={colors.cream} size={26} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={s.menuList}>
              {menuItems.map((item) => (
                <Pressable
                  key={item.label}
                  accessibilityRole="menuitem"
                  onPress={() => select(item.target)}
                  style={({ pressed }) => [s.menuItem, pressed && s.menuItemPressed]}
                >
                  <View style={s.menuIcon}>
                    <Icon name={item.icon} size={20} color={colors.maroon} />
                  </View>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  <Icon name="chevron-forward" size={18} color={colors.gold} />
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="App developed by VARK Traditions. Opens varktraditions.com"
              onPress={() => Linking.openURL("https://varktraditions.com/")}
              style={({ pressed }) => [s.credit, pressed && { opacity: 0.6 }]}
            >
              <Text style={s.creditText}>
                App developed by <Text style={s.creditLink}>VARK Traditions</Text>
              </Text>
              <Text style={s.creditUrl}>varktraditions.com</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export function AppFooter({
  activeTab,
  onNavigate,
}: {
  activeTab: AppTab;
  onNavigate: (tab: AppTab) => void;
}) {
  const { t, eventT } = useApp();
  const labels: Record<AppTab, string> = {
    Home: t.home,
    Temple: "About",
    Updates: "Pooja Services",
    Deeksha: "Deeksha",
    Songs: "Resources",
    Profile: t.profile,
  };
  return (
    <SafeAreaView edges={["bottom"]} style={s.bottomSafeArea}>
      <View style={s.footer}>
        {tabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onNavigate(tab)}
              style={({ pressed }) => [s.tab, pressed && s.pressed]}
            >
              <View style={s.iconWrap}>
                {(() => {
                  const def = icons[tab];
                  const color = active ? colors.maroon : colors.gold;
                  return def.set === "mci" ? (
                    <MaterialCommunityIcons
                      name={active ? def.active : def.inactive}
                      size={24}
                      color={color}
                    />
                  ) : (
                    <Icon
                      name={active ? def.active : def.inactive}
                      size={22}
                      color={color}
                    />
                  );
                })()}
              </View>
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>
                {labels[tab]}
              </Text>
              <View style={[s.indicator, active && s.indicatorActive]} />
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  topSafeArea: {
    backgroundColor: colors.maroonDeep,
    borderBottomWidth: 2,
    borderBottomColor: colors.goldFill,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: colors.goldFill,
    fontSize: 21,
    fontWeight: "700",
    fontFamily: "serif",
  },
  tagline: {
    color: colors.cream,
    fontSize: 9,
    letterSpacing: 1.6,
    fontWeight: "700",
    marginTop: 3,
  },
  headerAction: {
    flexShrink: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  menuRoot: { flex: 1, flexDirection: "row" },
  credit: {
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  creditText: { color: colors.muted, fontSize: 12 },
  creditLink: { color: colors.maroon, fontWeight: "700" },
  creditUrl: {
    color: colors.saffron,
    fontSize: 12,
    marginTop: 2,
    textDecorationLine: "underline",
  },
  menuBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  menuPanel: {
    width: "78%",
    maxWidth: 340,
    backgroundColor: colors.background,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: colors.maroonDeep,
    borderBottomWidth: 2,
    borderBottomColor: colors.goldFill,
  },
  menuList: { paddingVertical: 8 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  menuItemPressed: { backgroundColor: colors.raised },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.maroonSoft,
  },
  menuLabel: {
    flex: 1,
    color: colors.maroon,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSafeArea: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  footer: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  iconWrap: {
    width: 38,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
  tabLabelActive: { color: colors.maroon, fontWeight: "800" },
  indicator: { width: 34, height: 3, borderRadius: 2, marginTop: 3 },
  indicatorActive: { backgroundColor: colors.gold },
  pressed: { opacity: 0.62 },
});
