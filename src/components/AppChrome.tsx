import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TEMPLE } from "../data/content";
import { useApp } from "../state/AppContext";
import type { TabParamList } from "../types";
import { colors } from "../theme";
import { Icon } from "./UI";

export type AppTab = keyof TabParamList;

const tabs: AppTab[] = ["Home", "Temple", "Updates", "Deeksha", "Songs", "Profile"];
const icons: Record<
  AppTab,
  {
    active: React.ComponentProps<typeof Icon>["name"];
    inactive: React.ComponentProps<typeof Icon>["name"];
  }
> = {
  Home: { active: "home", inactive: "home-outline" },
  Songs: { active: "book", inactive: "book-outline" },
  Updates: { active: "flower", inactive: "flower-outline" },
  Temple: { active: "business", inactive: "business-outline" },
  Deeksha: { active: "ellipse", inactive: "ellipse-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

export function AppHeader({ onUpdates }: { onUpdates: () => void }) {
  return (
    <SafeAreaView edges={["top"]} style={s.topSafeArea}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={s.brand} numberOfLines={1} adjustsFontSizeToFit>
            {TEMPLE.name}
          </Text>
          <Text style={s.tagline} numberOfLines={1} adjustsFontSizeToFit>
            FAITH · CULTURE · SERVICE · COMMUNITY
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Temple updates"
          hitSlop={10}
          onPress={onUpdates}
          style={({ pressed }) => [s.headerAction, pressed && s.pressed]}
        >
          <Icon name="notifications-outline" color={colors.text} size={22} />
        </Pressable>
      </View>
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
                <Icon
                  name={active ? icons[tab].active : icons[tab].inactive}
                  size={22}
                  color={active ? colors.goldFill : "rgba(255,255,255,.82)"}
                />
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
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "700",
    fontFamily: "serif",
  },
  tagline: {
    color: colors.gold,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: "#6B4A12",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bottomSafeArea: {
    backgroundColor: colors.green,
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
    color: "rgba(255,255,255,.82)",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
  tabLabelActive: { color: colors.goldFill, fontWeight: "800" },
  indicator: { width: 34, height: 3, borderRadius: 2, marginTop: 3 },
  indicatorActive: { backgroundColor: colors.goldFill },
  pressed: { opacity: 0.62 },
});
