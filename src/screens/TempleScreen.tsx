import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "../types";
import { Card, Icon, IconName, Page, ScreenHeader } from "../components/UI";
import { colors } from "../theme";

const VALUES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "flame-outline",
    title: "Preserving Dharma",
    body: "Upholding Vedic traditions through daily worship, sacred rituals, and religious celebrations.",
  },
  {
    icon: "leaf-outline",
    title: "Nurturing Future Generations",
    body: "Helping children and young adults discover Hindu values, culture, and spiritual wisdom.",
  },
  {
    icon: "people-outline",
    title: "Serving Our Community",
    body: "Encouraging volunteerism, charitable activities, and meaningful connections among families and devotees.",
  },
  {
    icon: "musical-notes-outline",
    title: "Inspiring Spiritual Growth",
    body: "Bringing people together through bhajans, spiritual teachings, festivals, and devotional experiences.",
  },
];

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      {eyebrow ? (
        <Text style={s.sectionEyebrow}>{eyebrow.toUpperCase()}</Text>
      ) : null}
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function TempleScreen() {
  const tab = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const root = tab.getParent<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Page>
      <ScreenHeader
        eyebrow="About Our Temple"
        title="A Sacred Home for Devotion and Dharma"
      />
      <Text style={s.devotional}>Swamiye Saranam Ayyappa</Text>

      <Section title="Welcome to Atlanta Ayyappa Temple">
        <Text style={s.body}>
          Atlanta Ayyappa Temple is a sacred place of worship, devotion, and
          spiritual connection. Located in Cumming, Georgia, our temple brings
          together devotees and families to celebrate the timeless traditions
          and values of Sanatana Dharma.
        </Text>
      </Section>

      <Section eyebrow="Our Journey" title="Rooted in Devotion Since 2014">
        <Text style={s.body}>
          The temple was established on June 22, 2014, with the Vigraha
          Pratishtapana performed on June 29, 2014. Since then, it has grown
          into a spiritual home for devotees across North Metro Atlanta and
          surrounding communities.
        </Text>
      </Section>

      <Section
        eyebrow="Our Mission and Values"
        title="Guided by Dharma, United by Community"
      >
        <Text style={s.body}>
          Our mission is to create a welcoming spiritual environment where
          individuals and families can experience the richness of Hindu
          traditions through worship, learning, service, and community
          participation.
        </Text>
        <View style={s.values}>
          {VALUES.map((v) => (
            <Card key={v.title}>
              <View style={s.valueRow}>
                <View style={s.valueIcon}>
                  <Icon name={v.icon} size={22} color={colors.maroon} />
                </View>
                <View style={s.valueText}>
                  <Text style={s.valueTitle}>{v.title}</Text>
                  <Text style={s.valueBody}>{v.body}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </Section>

      <Section eyebrow="A Living Spiritual Community" title="Devotion Together">
        <Text style={s.body}>
          Through Ayyappa Deeksha, Padi Pooja, festivals, bhajans, and cultural
          programs, our temple continues to be a vibrant spiritual community. We
          warmly welcome devotees and families to participate, volunteer, and be
          part of this journey.
        </Text>
      </Section>

      <View style={s.visit}>
        <Icon name="location" size={26} color={colors.goldFill} />
        <View style={{ flex: 1 }}>
          <Text style={s.visitTitle}>Plan Your Visit</Text>
          <Text style={s.visitBody}>
            Experience the serenity of our temple, participate in poojas, and
            be part of our spiritual community.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => root?.navigate("ContactTemple")}
            style={({ pressed }) => [s.visitButton, pressed && { opacity: 0.75 }]}
          >
            <Icon name="navigate-outline" size={16} color={colors.maroonDeep} />
            <Text style={s.visitButtonText}>Contact & Location</Text>
          </Pressable>
        </View>
      </View>
    </Page>
  );
}

const s = StyleSheet.create({
  devotional: {
    color: colors.gold,
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  section: { marginTop: 22 },
  sectionEyebrow: {
    color: colors.saffron,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.maroon,
    fontSize: 21,
    fontWeight: "700",
    fontFamily: "serif",
    marginBottom: 10,
  },
  body: { color: colors.text, fontSize: 15, lineHeight: 23 },
  values: { marginTop: 14, gap: 12 },
  valueRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  valueIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.maroonSoft,
  },
  valueText: { flex: 1 },
  valueTitle: {
    color: colors.maroon,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "serif",
    marginBottom: 4,
  },
  valueBody: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  visit: {
    marginTop: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 14,
    backgroundColor: colors.maroonDeep,
    borderWidth: 1,
    borderColor: colors.goldFill,
  },
  visitTitle: {
    color: colors.goldFill,
    fontSize: 19,
    fontWeight: "700",
    fontFamily: "serif",
    marginBottom: 4,
  },
  visitBody: { color: colors.cream, fontSize: 14, lineHeight: 20 },
  visitButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.goldFill,
  },
  visitButtonText: { color: colors.maroonDeep, fontSize: 14, fontWeight: "700" },
});
