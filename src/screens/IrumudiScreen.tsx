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
import { BackButton, Icon, IconName } from "../components/UI";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";
import { DEEKSHA_REGISTRATION_ENABLED, showComingSoon } from "../features";
import QuickLinksFab from "../components/QuickLinksFab";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// ---------------------------------------------------------------------------
// CONTENT — placeholders; replace with the final text.
// ---------------------------------------------------------------------------

/** Same banner image as the Deeksha page. */
const HERO_IMAGE = require("../../assets/temple/deeksha-hero.jpeg");

const HERO = {
  eyebrow: "Irumudi Guidelines",
  title: "Irumudi Guidelines",
  subtitle:
    "A sacred journey of preparation, surrender, and devotion to Lord Ayyappa.",
  devotional: "Swamiye Saranam Ayyappa",
};

const INTRO = {
  title: "Dear Swamies,",
  body: "By the divine grace of Lord Ayyappa, as we approach the sacred Irumudi Kattu, please follow these humble guidelines to help prepare and participate with sincerity and devotion.",
};

const REGISTRATION = {
  title: "Irumudi Registration",
  body: "Please complete your Irumudi registration on the temple website and confirm your timing and other details with the Temple Irumudi Coordinator.",
  reminder: "Arrive 15 minutes before the scheduled time.",
  buttonLabel: "Register for Irumudi",
};

/** A bullet is plain text, or text followed by a tappable "here" link to registration. */
type Point = string | { text: string; link: string };

type Section = {
  icon: IconName;
  tint: string;
  title: string;
  subtitle: string;
  points: Point[];
};

const SECTIONS: Section[] = [
  {
    icon: "calendar-outline",
    tint: "#FFF1DA",
    title: "Before Irumudi",
    subtitle: "Registration and Previous-Day Preparation",
    points: [
      { text: "Complete your Irumudi registration ", link: "here" },
      "Contact the Temple Irumudi Coordinator to confirm your scheduled time and other details.",
      "If you already have an Irumudi bag, wash and clean it properly.",
      "Visit the temple the previous day to clean the Nei (ghee) coconut in advance.",
    ],
  },
  {
    icon: "home-outline",
    tint: "#E4F0E6",
    title: "On Irumudi Day – At Home",
    subtitle: "Morning Rituals and Departure",
    points: [
      "Perform your regular morning pooja.",
      "Gather all your belongings before breaking the coconut.",
      "Break one coconut outside your home before leaving for the temple.",
      "Once the coconut is broken, do not re-enter the house.",
      "Optional: You may bring a small amount of rice, ghee, and fruits to offer during Irumudi preparation.",
    ],
  },
  {
    icon: "business-outline",
    tint: "#FFF1DA",
    title: "At the Temple",
    subtitle: "Arrival and Irumudi Kattu",
    points: [
      "All Irumudi items will be provided by the temple.",
      "Arrive at least 15 minutes before your scheduled time.",
      "Participate in the sacred Irumudi Kattu Niraithal ceremony with sincerity and devotion.",
      "Chant sincerely, keep Lord Ayyappa in your thoughts, and maintain a prayerful atmosphere throughout the ceremony.",
    ],
  },
  {
    icon: "flower-outline",
    tint: "#FCE4E6",
    title: "After Irumudi Is Tied",
    subtitle: "Temple Rituals and Offerings",
    points: [
      "Once the Irumudi is placed on your forehead, proceed outside the temple and break a coconut.",
      "Circumambulate the temple and break another coconut before entering the Ayyappa Sannidhanam.",
      "If you are offering at another temple (e.g., Tampa), break the coconut outside, place the Irumudi reverently in your vehicle, and then proceed.",
      "During Irumudi opening and ghee offering, maintain sincere chanting and devotion.",
      "Offer turmeric and kumkum powder to Sri Manjamatha.",
      "Before leaving the temple, collect your Irumudi bag, rice, and ghee container.",
    ],
  },
  {
    icon: "people-outline",
    tint: "#F0E6FA",
    title: "After Returning Home",
    subtitle: "Aarthi, Prasadam, and Mala Care",
    points: [
      "Break a coconut outside your home before entering.",
      "Proceed to your pooja room and perform Aarthi to Swamy.",
      "Use the rice from your Irumudi bag to prepare a sweet prasadam for Lord Ayyappa and share it with family and friends.",
      "When removing your mala (before Harivarasanam at the temple), place it respectfully in a small box or resealable bag.",
      "Sprinkle Vibhuti or Chandanam over the mala and store it safely for future use.",
    ],
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

const RESOURCES: { icon: IconName; label: string; onPress?: (n: Nav) => void }[] = [
  {
    icon: "flower-outline",
    label: "Ayyappa Deeksha",
    onPress: (n) => n.navigate("MainTabs", { screen: "Deeksha" }),
  },
  { icon: "ellipse-outline", label: "Maladharana", onPress: (n) => goMaladharana(n) },
  { icon: "home-outline", label: "Book Home Padi Puja", onPress: (n) => n.navigate("HomePadiPuja") },
  {
    icon: "create-outline",
    label: "Irumudi Registration",
    onPress: (n) => goIrumudiRegistration(n),
  },
];

function goMaladharana(n: Nav) {
  if (DEEKSHA_REGISTRATION_ENABLED) n.navigate("Maladharana");
  else showComingSoon("Maladharana", "Maladharana registration");
}
function goIrumudiRegistration(n: Nav) {
  if (DEEKSHA_REGISTRATION_ENABLED) n.navigate("IrumudiRegistration");
  else showComingSoon("Irumudi Registration", "Irumudi registration");
}

const SIGNIFICANCE = {
  title: "Spiritual Significance — Ātma Samarpanam",
  intro: "The Irumudi represents Ātma Samarpanam — the surrender of one’s soul to Lord Ayyappa.",
  items: [
    { icon: "ellipse" as IconName, title: "Coconut Shell", body: "Symbolizes our perishable body." },
    { icon: "flame" as IconName, title: "Ghee Within", body: "Represents the pure, eternal soul (Ātma)." },
  ],
  closing: "By offering it to Lord Ayyappa, we surrender our inner self with devotion and humility.",
};

const NOTE = {
  title: "Important Note",
  body: "These guidelines are based on traditional practices. Observances may vary according to lineage and individual circumstances. For specific questions or guidance, please consult your Guruswamy or temple priest.",
};

// ---------------------------------------------------------------------------

export default function IrumudiScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [open, setOpen] = useState<number | null>(0);
  const goRegister = () => goIrumudiRegistration(navigation);
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
          <Text style={s.heroEyebrow}>{HERO.eyebrow.toUpperCase()}</Text>
          <Text style={s.heroTitle}>{HERO.title}</Text>
          <View style={s.heroRule} />
          <Text style={s.heroSub}>{HERO.subtitle}</Text>
          <Text style={s.heroDevotional}>{HERO.devotional}</Text>
        </View>
      </ImageBackground>

      <View style={s.page}>
        <BackButton navigation={navigation} compact />

        {/* Intro */}
        <View style={s.intro}>
          <View style={[s.circle, { backgroundColor: colors.maroonSoft }]}>
            <Icon name="flower-outline" size={24} color={colors.saffron} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.introTitle}>{INTRO.title}</Text>
            <Text style={s.body}>{INTRO.body}</Text>
          </View>
        </View>

        {/* Registration */}
        <View style={s.register}>
          <View style={[s.circle, { backgroundColor: colors.surface }]}>
            <Icon name="calendar-outline" size={22} color={colors.saffron} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.registerTitle}>{REGISTRATION.title}</Text>
            <Text style={s.registerBody}>{REGISTRATION.body}</Text>
            <View style={s.reminder}>
              <Icon name="time-outline" size={15} color={colors.maroon} />
              <Text style={s.reminderText}>{REGISTRATION.reminder}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={goRegister}
              style={({ pressed }) => [s.registerButton, pressed && { opacity: 0.75 }]}
            >
              <Text style={s.registerButtonText}>{REGISTRATION.buttonLabel}</Text>
              <Icon name="chevron-forward" size={16} color={colors.cream} />
            </Pressable>
          </View>
        </View>

        {/* Accordion */}
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
                  <Text style={s.sectionSub}>{section.subtitle}</Text>
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
                      {typeof point === "string" ? (
                        <Text style={s.pointText}>{point}</Text>
                      ) : (
                        <Text style={s.pointText}>
                          {point.text}
                          <Text style={s.pointLink} onPress={goRegister}>
                            {point.link}
                          </Text>
                          .
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}

        {/* Spiritual significance */}
        <View style={s.significance}>
          <Text style={s.sigTitle}>{SIGNIFICANCE.title}</Text>
          <Text style={s.sigText}>{SIGNIFICANCE.intro}</Text>
          <View style={s.sigRow}>
            {SIGNIFICANCE.items.map((item) => (
              <View key={item.title} style={s.sigCard}>
                <View style={[s.circle, { backgroundColor: colors.cream }]}>
                  <Icon name={item.icon} size={22} color={colors.saffron} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.sigCardTitle}>{item.title}</Text>
                  <Text style={s.sigCardBody}>{item.body}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={s.sigText}>{SIGNIFICANCE.closing}</Text>
        </View>

        {/* Note */}
        <View style={s.note}>
          <Icon name="information-circle" size={26} color="#2F6FD1" />
          <View style={{ flex: 1 }}>
            <Text style={s.noteTitle}>{NOTE.title}</Text>
            <Text style={s.noteBody}>{NOTE.body}</Text>
          </View>
        </View>

        {/* Related resources */}
        <Text style={s.resourcesTitle}>Related Resources</Text>
        <View style={s.resources}>
          {RESOURCES.map((r) => (
            <Pressable
              key={r.label}
              accessibilityRole="button"
              onPress={r.onPress ? () => r.onPress!(navigation) : undefined}
              style={({ pressed }) => [s.resource, pressed && { opacity: 0.75 }]}
            >
              <View style={[s.resourceIcon, { backgroundColor: colors.maroonSoft }]}>
                {r.label === "Maladharana" ? (
                  <MaterialCommunityIcons name="necklace" size={22} color={colors.maroon} />
                ) : (
                  <Icon name={r.icon} size={22} color={colors.maroon} />
                )}
              </View>
              <Text style={s.resourceLabel} numberOfLines={2}>
                {r.label}
              </Text>
              <Icon name="chevron-forward" size={18} color={colors.saffron} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
    <QuickLinksFab
      actions={RESOURCES.filter((r) => r.onPress).map((r) => ({
        label: r.label,
        icon: r.icon,
        mci: r.label === "Maladharana" ? "necklace" : undefined,
        onPress: () => r.onPress!(navigation),
      }))}
    />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 115 },
  page: { paddingHorizontal: 16, paddingTop: 10 },
  hero: { minHeight: 260, justifyContent: "center" },
  heroCopy: { width: "62%", paddingHorizontal: 18, paddingVertical: 22 },
  heroEyebrow: { color: colors.goldFill, fontSize: 11, fontWeight: "700", letterSpacing: 1.6 },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "700", lineHeight: 32, marginTop: 8 },
  heroRule: { width: 40, height: 2, backgroundColor: colors.goldFill, marginVertical: 10 },
  heroSub: { color: colors.cream, fontSize: 13, lineHeight: 19 },
  heroDevotional: { color: colors.goldFill, fontSize: 13, fontWeight: "600", marginTop: 8 },
  circle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  intro: { flexDirection: "row", gap: 14, marginTop: 8, marginBottom: 16 },
  introTitle: { color: colors.maroon, fontSize: 18, fontWeight: "700", marginBottom: 6 },
  body: { color: colors.text, fontSize: 13, lineHeight: 20 },
  register: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: "#FFF1DA",
    borderWidth: 1,
    borderColor: colors.line,
  },
  registerTitle: { color: colors.maroon, fontSize: 16, fontWeight: "700" },
  registerBody: { color: colors.text, fontSize: 12, lineHeight: 18, marginTop: 4 },
  registerButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.maroon,
  },
  registerButtonText: { color: colors.cream, fontSize: 13, fontWeight: "700" },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
    overflow: "hidden",
  },
  sectionOpen: { borderColor: colors.goldFill },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  sectionTitle: { color: colors.maroon, fontSize: 15, fontWeight: "700" },
  sectionSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
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
  pointLink: { color: colors.maroon, fontWeight: "700", textDecorationLine: "underline" },
  reminder: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  reminderText: { flex: 1, color: colors.maroon, fontSize: 12, fontWeight: "600" },
  significance: {
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.maroonDeep,
    borderWidth: 1,
    borderColor: colors.goldFill,
  },
  sigTitle: { color: colors.goldFill, fontSize: 18, fontWeight: "700", marginBottom: 6 },
  sigText: { color: colors.cream, fontSize: 12, lineHeight: 18 },
  sigRow: { flexDirection: "row", gap: 10, marginVertical: 12 },
  sigCard: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(235,192,98,0.4)",
  },
  sigCardTitle: { color: colors.goldFill, fontSize: 13, fontWeight: "700" },
  sigCardBody: { color: colors.cream, fontSize: 11, lineHeight: 16, marginTop: 3 },
  note: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    marginTop: 14,
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
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  resourceLabel: { flex: 1, color: colors.maroon, fontSize: 15, fontWeight: "700" },
});
