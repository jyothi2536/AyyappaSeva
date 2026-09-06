import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TEMPLE } from "../data/content";
import { useApp } from "../state/AppContext";
import type { TabParamList } from "../types";
import { colors } from "../theme";
import { Icon } from "./UI";

export type AppTab = keyof TabParamList;

const tabs: AppTab[] = ["Home", "Songs", "Updates", "Temple", "Profile"];
const icons: Record<
  AppTab,
  {
    active: React.ComponentProps<typeof Icon>["name"];
    inactive: React.ComponentProps<typeof Icon>["name"];
  }
> = {
  Home: { active: "home", inactive: "home-outline" },
  Songs: { active: "musical-notes", inactive: "musical-notes-outline" },
  Updates: { active: "notifications", inactive: "notifications-outline" },
  Temple: { active: "business", inactive: "business-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

export function AppHeader({ onUpdates }: { onUpdates: () => void }) {
  return (
    <SafeAreaView edges={["top"]} style={s.topSafeArea}>
      <View style={s.header}>
        <Text accessibilityRole="header" style={s.brand}>
          {TEMPLE.name}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Temple updates"
          hitSlop={10}
          onPress={onUpdates}
          style={({ pressed }) => [s.headerAction, pressed && s.pressed]}
        >
          <Icon name="notifications-outline" color={colors.gold} size={21} />
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
    Songs: t.songs,
    Updates: eventT.events,
    Temple: t.temple,
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
              <View style={[s.iconWrap, active && s.iconActive]}>
                <Icon
                  name={active ? icons[tab].active : icons[tab].inactive}
                  size={20}
                  color={active ? colors.ink : colors.muted}
                />
              </View>
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>
                {labels[tab]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  topSafeArea: {
    backgroundColor: "rgba(12,12,9,.99)",
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
    flex: 1,
    color: colors.cream,
    fontSize: 20,
    fontWeight: "700",
  },
  headerAction: {
    flexShrink: 0,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(233,185,73,.08)",
    borderWidth: 1,
    borderColor: "rgba(233,185,73,.18)",
  },
  bottomSafeArea: {
    backgroundColor: "rgba(12,12,9,.99)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  footer: {
    height: 68,
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
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  iconActive: { backgroundColor: colors.gold },
  tabLabel: { color: colors.muted, fontSize: 9, fontWeight: "700" },
  tabLabelActive: { color: colors.gold },
  pressed: { opacity: 0.62 },
});
