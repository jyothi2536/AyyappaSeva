import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "../types";
import { Icon, IconName } from "../components/UI";
import { colors } from "../theme";
import DeekshaCountdown from "../components/DeekshaCountdown";
import { IrumudiBody } from "./IrumudiScreen";
import HomePadiGuidelines from "./HomePadiGuidelines";
import QuickLinksFab from "../components/QuickLinksFab";
import { DEEKSHA_REGISTRATION_ENABLED, showComingSoon } from "../features";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// ---------------------------------------------------------------------------
// CONTENT — replace the placeholders below with the final text and image.
// ---------------------------------------------------------------------------

const HERO_IMAGE = require("../../assets/temple/deeksha-hero.jpeg");

const HERO = {
  eyebrow: "Ayyappa Deeksha",
  title: "Guidelines to Follow During Ayyappa Vratham",
  subtitle: "A journey of devotion, discipline and inner transformation.",
  devotional: "Swamiye Saranam Ayyappa",
};

const HERO_BY_VIEW = {
  vratham: {
    eyebrow: "Ayyappa Deeksha",
    title: "Guidelines to Follow During Ayyappa Vratham",
    subtitle: "A journey of devotion, discipline and inner transformation.",
  },
  padi: {
    eyebrow: "Home Padi Puja",
    title: "Guidelines to Follow During Home Padipuja",
    subtitle: "Prepare and perform the Padi Puja at home with devotion.",
  },
  irumudi: {
    eyebrow: "Irumudi",
    title: "Guidelines to Follow During Irumudi",
    subtitle: "Prepare your Irumudi Kettu for the sacred pilgrimage.",
  },
} as const;

const ABOUT = {
  title: "About Ayyappa Vratham",
  body: "Ayyappa Vratham (Deeksha) is a sacred period of prayer, self-discipline and devotion. These guidelines help devotees observe the Vratham in a meaningful and traditional way, while cultivating a pure mind, compassionate heart and spiritual focus.",
};

type Section = {
  icon: IconName;
  tint: string;
  title: string;
  points: string[];
};

const SECTIONS: Section[] = [
  {
    icon: "sunny-outline",
    tint: "#FFF1DA",
    title: "Daily Routine & Pooja",
    points: [
      "Begin the day with a bath and prayer, traditionally before sunrise.",
      "Perform morning and evening pooja according to your Deeksha practice.",
      "Offer prayers and Ashtottaram (108 names) to Lord Ganesha, Subramanya, Durga, and Ayyappa.",
      "Chant Harivarasanam after the evening pooja.",
      "Visit the temple regularly whenever possible.",
    ],
  },
  {
    icon: "restaurant-outline",
    tint: "#FCE4E6",
    title: "Food & Dietary Guidelines",
    points: [
      "Follow a simple vegetarian diet, avoiding meat, eggs, onion, and garlic.",
      "Prefer freshly prepared home-cooked meals.",
      "Choose fruits for breakfast and lighter foods such as idli or upma for dinner.",
      "Offer fruits as Naivedyam to Lord Ayyappa.",
      "Observe traditional food preparation practices according to guidance from your Guruswamy.",
    ],
  },
  {
    icon: "shirt-outline",
    tint: "#E4ECFB",
    title: "Dress Code & Mala",
    points: [
      "Traditionally wear black, blue, or saffron clothing, with black often preferred.",
      "Wear clean clothing each day.",
      "Keep the sacred mala on throughout Deeksha, seeking guidance before removing it.",
      "Follow traditional grooming observances according to your Guruswamy.",
      "Adapt footwear observances where necessary for work, health, or safety.",
    ],
  },
  {
    icon: "heart-outline",
    tint: "#E4F0E6",
    title: "Self-Discipline & Conduct",
    points: [
      "Practice patience, humility, and control over anger.",
      "Avoid smoking, alcohol, and unnecessary indulgences.",
      "Maintain Brahmacharyam and the personal discipline associated with Vratham.",
      "Limit entertainment and devote more time to prayer and reflection.",
      "Practice kindness, truthfulness, and mindful speech.",
    ],
  },
  {
    icon: "people-outline",
    tint: "#F0E6FA",
    title: "Family & Respect",
    points: [
      "Address fellow devotees respectfully as Swamy and women as Matha, in accordance with tradition.",
      "Maintain respectful and compassionate relationships with family members.",
      "Practice cleanliness and mindfulness while preparing and sharing meals.",
      "Seek temple guidance on traditional household observances during Vratham.",
    ],
  },
  {
    icon: "flower-outline",
    tint: "#FFF1DA",
    title: "Devotional Life & Spiritual Practice",
    points: [
      "Participate in Ayyappa bhajans and temple prayers whenever possible.",
      "Practice Ayyappa Nama Japam and devotional reflection.",
      "Attend Annadanam and community devotional gatherings when appropriate.",
      "Keep your thoughts focused on devotion, service, and spiritual growth.",
    ],
  },
];

const NOTE = {
  title: "Important Note",
  body: "These guidelines are based on traditional practices. Observances may vary according to lineage and individual circumstances. For specific questions or guidance, please consult your Guruswamy or temple priest.",
};

const RESOURCES: { icon: IconName; label: string; route?: "Irumudi" | "Maladharana" | "HomePadiPuja" }[] = [
  { icon: "ellipse-outline", label: "Maladharana", route: "Maladharana" },
  { icon: "home-outline", label: "Book Home Padi Puja", route: "HomePadiPuja" },
  { icon: "bag-handle-outline", label: "Irumudi", route: "Irumudi" },
];

// ---------------------------------------------------------------------------

export default function DeekshaScreen() {
  const [open, setOpen] = useState<number | null>(0);
  const [view, setView] = useState<"vratham" | "padi" | "irumudi">("vratham");
  const hero = HERO_BY_VIEW[view];
  const tab = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const root = tab.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const openResource = (r: (typeof RESOURCES)[number]) => {
    if (!r.route) return;
    if (!DEEKSHA_REGISTRATION_ENABLED && r.route === "Maladharana") {
      showComingSoon(r.label, `${r.label} registration`);
      return;
    }
    root?.navigate(r.route);
  };
  return (
    <View style={s.root}>
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <ImageBackground source={HERO_IMAGE} resizeMode="cover" style={s.hero}>
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(40,6,6,.92)", "rgba(40,6,6,.55)", "rgba(40,6,6,0)"]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.heroCopy}>
          <Text style={s.heroEyebrow}>{hero.eyebrow.toUpperCase()}</Text>
          <Text style={s.heroTitle}>{hero.title}</Text>
          <View style={s.heroRule} />
          <Text style={s.heroSub}>{hero.subtitle}</Text>
          <Text style={s.heroDevotional}>{HERO.devotional}</Text>
        </View>
      </ImageBackground>

      <View style={s.page}>
        {/* Guidelines selector */}
        <View style={s.chips}>
          {(
            [
              { key: "vratham", label: "Ayyappa Vratham" },
              { key: "padi", label: "Home Padi Puja" },
              { key: "irumudi", label: "Irumudi" },
            ] as const
          ).map((c) => {
            const active = c.key === view;
            return (
              <Pressable
                key={c.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setView(c.key)}
                style={[s.chip, active && s.chipActive]}
              >
                <Text style={[s.chipText, active && s.chipTextActive]} numberOfLines={2}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <DeekshaCountdown />
        {view === "irumudi" ? (
          <IrumudiBody />
        ) : view === "padi" ? (
          <HomePadiGuidelines />
        ) : (
        <>
        {/* About */}
        <View style={s.about}>
          <View style={[s.circle, { backgroundColor: colors.maroonSoft }]}>
            <Icon name="flower-outline" size={24} color={colors.saffron} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.aboutTitle}>{ABOUT.title}</Text>
            <Text style={s.body}>{ABOUT.body}</Text>
          </View>
        </View>

        {/* Accordion sections */}
        {SECTIONS.map((section, index) => {
          const expanded = open === index;
          return (
            <View key={section.title} style={[s.section, expanded && s.sectionOpen]}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={() => setOpen(expanded ? null : index)}
                style={({ pressed }) => [s.sectionHead, pressed && { opacity: 0.75 }]}
              >
                <View style={[s.circle, { backgroundColor: section.tint }]}>
                  <Icon name={section.icon} size={22} color={colors.saffron} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.sectionTitle}>{section.title}</Text>
                </View>
                <Icon
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.saffron}
                />
              </Pressable>
              {expanded ? (
                <View style={s.points}>
                  {section.points.map((point, i) => (
                    <View key={i} style={s.point}>
                      <Icon name="checkmark-circle" size={18} color={colors.saffron} />
                      <Text style={s.pointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}

        {/* Important note */}
        <View style={s.note}>
          <Icon name="information-circle" size={26} color="#2F6FD1" />
          <View style={{ flex: 1 }}>
            <Text style={s.noteTitle}>{NOTE.title}</Text>
            <Text style={s.noteBody}>{NOTE.body}</Text>
          </View>
        </View>
        </>
        )}
      </View>
    </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 115 },
  page: { paddingHorizontal: 16, paddingTop: 18 },
  hero: { minHeight: 260, justifyContent: "center" },
  heroCopy: { width: "62%", paddingHorizontal: 18, paddingVertical: 22 },
  heroEyebrow: {
    color: colors.goldFill,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
    marginTop: 8,
  },
  heroRule: {
    width: 40,
    height: 2,
    backgroundColor: colors.goldFill,
    marginVertical: 10,
  },
  heroSub: { color: colors.cream, fontSize: 13, lineHeight: 19 },
  heroDevotional: {
    color: colors.goldFill,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  chips: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  chipText: { color: colors.maroon, fontSize: 12, fontWeight: "700", textAlign: "center" },
  chipTextActive: { color: "#FFFFFF" },
  soon: {
    alignItems: "center",
    gap: 8,
    padding: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  soonTitle: { color: colors.maroon, fontSize: 17, fontWeight: "700" },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  about: { flexDirection: "row", gap: 14, marginBottom: 16 },
  aboutTitle: {
    color: colors.maroon,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  body: { color: colors.text, fontSize: 13, lineHeight: 20 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
    overflow: "hidden",
  },
  sectionOpen: { borderColor: colors.goldFill },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  sectionTitle: { color: colors.maroon, fontSize: 15, fontWeight: "700" },
  points: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    gap: 8,
  },
  point: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 6 },
  pointText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },
  note: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: "#E8F0FC",
  },
  noteTitle: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  noteBody: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  resourcesTitle: {
    color: colors.maroon,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 10,
  },
  resources: { gap: 10 },
  resource: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  resourceLabel: { flex: 1, color: colors.maroon, fontSize: 15, fontWeight: "700" },
});
