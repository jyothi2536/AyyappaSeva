import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Icon, Page, ScreenHeader } from "../components/UI";
import type { RootStackParamList, TabParamList } from "../types";
import { colors } from "../theme";

type Option = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  mci?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  comingSoon?: boolean;
  route: "HomePadiPuja" | "Maladharana" | "Irumudi" | "BookPooja";
};

const OPTIONS: Option[] = [
  {
    title: "Home Padi Pooja",
    subtitle: "Book a Padi Pooja at your home",
    icon: "home-outline",
    route: "HomePadiPuja",
  },
  {
    title: "Maladharana",
    subtitle: "Coming soon",
    icon: "ellipse-outline",
    mci: "necklace",
    comingSoon: true,
    route: "Maladharana",
  },
  {
    title: "Irumudi",
    subtitle: "Coming soon",
    icon: "flower-outline",
    comingSoon: true,
    route: "Irumudi",
  },
  {
    title: "Book a Pooja",
    subtitle: "Request a pooja or seva at the temple",
    icon: "flower-outline",
    route: "BookPooja",
  },
];

/** "Pooja & Registrations" tab: one place to start any pooja booking or registration. */
export default function PoojaScreen() {
  const tab = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const root = tab.getParent<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Page>
      <ScreenHeader
        eyebrow="Seva"
        title="Pooja & Registrations"
        subtitle="Book a pooja or register for Deeksha."
      />
      {OPTIONS.map((option) => (
        <Pressable
          key={option.route}
          accessibilityRole="button"
          style={({ pressed }) => [
            s.card,
            option.comingSoon && { opacity: 0.6 },
            pressed && !option.comingSoon && { opacity: 0.7 },
          ]}
          disabled={option.comingSoon}
          onPress={() => root?.navigate(option.route)}
        >
          <View style={s.iconWrap}>
            {option.mci ? (
              <MaterialCommunityIcons name={option.mci} size={24} color={colors.maroon} />
            ) : (
              <Icon name={option.icon} size={24} color={colors.maroon} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{option.title}</Text>
            <Text style={s.sub}>{option.subtitle}</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
      ))}
    </Page>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldFill,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: "800" },
  sub: { color: colors.muted, fontSize: 12, marginTop: 3 },
});
