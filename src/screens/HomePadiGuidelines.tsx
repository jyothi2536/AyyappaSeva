import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon, IconName } from "../components/UI";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

// Content from "Home Padi Pooja Booklet" – Atlanta Ayyappa Temple.

const INTRO = {
  title: "Swamiye Saranam!",
  body: "Padi Pooja is hosted in the homes of Ayyappa devotees during the Mandala Kalam period (first week of November until January 14), on days other than Saturdays or major event days. These guidelines help you prepare for the sacred event.",
};

const BOOKING = {
  title: "Reserve Your Home Padi Pooja",
  body: "Ayyappa Swamies who are on dheeksha can book a slot Monday to Friday and Sunday. Saturdays are reserved for Padi Pooja at the temple. Contact Guruswami for availability.",
  guru: "Guruswami Naga Ravi Kumar Medicherla · +1 678 549 4646",
  buttonLabel: "Book Home Padi Pooja",
};

type Section = {
  icon: IconName;
  tint: string;
  title: string;
  subtitle: string;
  points: string[];
};

const SECTIONS: Section[] = [
  {
    icon: "calendar-outline",
    tint: "#FFF1DA",
    title: "Reserve a Slot",
    subtitle: "Available days and booking",
    points: [
      "Home Padi Pooja can be scheduled Monday to Friday and Sunday. Saturdays are reserved for Padi Pooja at the temple.",
      "Not all weekdays are available because of temple events or special occasions. Check event restrictions before reserving.",
      "Book through the temple website (atlantaayyappatemple.org/House-Padi-Pooja.php) or contact Guruswami Ravi garu to confirm availability.",
    ],
  },
  {
    icon: "list-outline",
    tint: "#E4F0E6",
    title: "Before the Event Day",
    subtitle: "Preparation after booking",
    points: [
      "Attend or assist at least 3 or 4 Padi Poojas at other Swamies' homes to understand how the event is held.",
      "Prepare an Evite with your Padi Pooja date and time, address, phone number, parking instructions and gate code (if any).",
      "Contact the temple to add the Evite to the Temple WhatsApp Group so you can invite all the Swamies. You may also share it with friends and family.",
      "Collect all Padi Pooja items from the temple and wash them cleanly before arranging the Pooja.",
      "Buy all the items listed in the guide well in advance to avoid a last-minute rush.",
    ],
  },
  {
    icon: "home-outline",
    tint: "#FCE4E6",
    title: "Stage and Padi Setup",
    subtitle: "On the event day",
    points: [
      "Clean your entire home, especially the hall or room where the Padi Pooja will be performed.",
      "Create a sacred stage: arrange a table, cover it with a saree, and place Ganesha, Ayyappa and Muruga in that order.",
      "Clean all the deity photos with damp tissue paper. Lord Ayyappa must be exactly at the centre of the table.",
      "Use wooden planks or hollow blocks to steady the photos so they do not move during the Pooja.",
      "Apply Chandan and Kumkum to all three moorthis and to all the padis. Place the Padi exactly at the centre of the table.",
      "Hang garlands for all three moorthis, and a lime garland for Ayyappa.",
      "Decorate the Padi as you prefer. Minimum: two flowers, two fruits, two lamps from the temple, and a Kalasam (for an elaborate Pooja).",
      "Elaborate Padi Pooja: prepare 18 Kalasams. Into each put 1 pinch kalasa powder, 2 turmeric sticks, 2 dry dates, 2 pooja supari, 2 coins, 5 mango leaves, water (half full), a coconut and a vastram.",
      "Lamps: three cotton wicks rolled into one, filled with oil and a little smoke camphor on the tip. Prepare the Ganesha lamp, Muruga lamp, Ayyappa trikani lamp, the big Ayyappa lamp (in front of the Padi) and 36 Padi lamps (two on each Padi).",
      "Padi Pattu lamps, filled with viboothi: first 6 padis use 3 smokeless camphors + 1 smoke camphor; next 6 use 2 + 1; last 6 use 1 + 1. Keep them in a tray for use after Ayyappa Abhishekam.",
      "In a large tray prepare 22 thamboolams for archana and Padi. Each has 2 betel leaves, 2 betel nuts, 2 turmeric sticks, 2 dry dates and 2 coins.",
      "Keep 36 bananas in a big tray for the Padi Pooja.",
      "Keep a clean, separate, slightly raised place covered with a new cloth for the Utsava Moorthi until abhishekam.",
    ],
  },
  {
    icon: "flower-outline",
    tint: "#FFF1DA",
    title: "Pooja Preparation",
    subtitle: "Flowers, prasadam and trays",
    points: [
      "Prepare loose flowers for the Padi and Aaradhana. Remove stems from roses or mums and place them in large trays.",
      "In a small tray keep four bowls: turmeric powder, kumkum, sandal powder and akshada.",
      "Akshada: take a bowl of sona masoori rice, add a few drops of ghee and one teaspoon of turmeric powder, and mix well.",
      "Ganesha tray: aval (flattened rice), jaggery, sugar candy. Muruga tray: pori (puffed rice), jaggery, sugar candy.",
      "Prepare the Yeka Harathi lamp with cotton wicks and oil.",
      "In a small tray keep: Yeka harathi, agarbathi and stand, smokeless camphor, smoke camphor, 6 betel leaves and a bell.",
      "Keep two plates of neivedyam and thamboolam ready for Ganesha and Muruga: one set thamboolam, 2 bananas and one whole coconut (to be broken just before the Pooja).",
      "For Ganesha Pooja keep 2 betel leaves, sona masoori rice and turmeric powder (for making a Ganesha).",
    ],
  },
  {
    icon: "water-outline",
    tint: "#E4ECFB",
    title: "Abhishekam Preparation",
    subtitle: "Items and Panchamrutham",
    points: [
      "Keep ready: milk, curd, ghee (melt just before abhishekam so it does not freeze), honey, brown sugar, panchamrutham, chandan paste (flowing, not too watery) and viboothi powder.",
      "Use the abhishekapatra from the temple filled with warm water just before abhishekam.",
      "Only Swamies who are on mala should prepare Panchamrutham, covering their mouth with their black towel while preparing it.",
      "Cut banana, pomegranate and dry fruits and mash them with a sugarcane stick. Add honey and jaggery, then add milk to adjust the consistency.",
      "Keep enough silver or new metal tumblers or bowls for abhishekam. Do not use paper or plastic tumblers.",
    ],
  },
  {
    icon: "musical-notes-outline",
    tint: "#F0E6FA",
    title: "Bhajan Preparation",
    subtitle: "Audio system from the temple",
    points: [
      "Pre-plan a place in your home where the Bhajan team can sit comfortably, with enough space and seating.",
      "Connect the speakers, microphones and other equipment to the mixer and check that everything works.",
      "For any doubt about the audio setup or Bhajan session, contact the Bhajan team coordinator.",
      "Handle the audio equipment with care and return it in the same condition, properly packed and safely transported to the temple.",
    ],
  },
  {
    icon: "sunny-outline",
    tint: "#E4F0E6",
    title: "After the Event Day",
    subtitle: "The day following your Padi Pooja",
    points: [
      "Begin the day with a bath and get ready for the Pooja of the Utsava Moorthi.",
      "Sing or play the Ayyappa Suprabhatham.",
      "Perform your regular Ayyappa Pooja with neivedhyam and aarathi.",
      "Remove all lamps and flowers and clean the Padi thoroughly with a wet cloth.",
      "Wash all the lamps with tamarind paste and peetambari powder. Clean the deity photos with a fresh wet cloth.",
      "Load everything to be returned to the temple into your car. Someone from your family or a friend should carry the Utsava Moorthi by hand while you drive.",
      "At the temple, have the items verified by the temple priest or person in charge. Be careful in transit, and report any damage or loss promptly.",
    ],
  },
  {
    icon: "time-outline",
    tint: "#FFF1DA",
    title: "Home Padi Pooja Timings",
    subtitle: "Morning and evening schedules",
    points: [
      "Morning: Ganapathi Homam 8:00 AM · Ganesh Pooja 8:30 AM · Subramanya Pooja 9:00 AM · Ayyappa Padi Pooja 9:30 AM · Ayyappa Abhishekam 11:00 AM · Padi Paatu 12:15 PM · Sabarigireesashtakam 12:30 PM · Prasadham 12:45 PM.",
      "Evening: Ganapathi Homam 4:00 PM · Ganesh Pooja 4:30 PM · Subramanya Pooja 5:00 PM · Ayyappa Padi Pooja 5:30 PM · Ayyappa Abhishekam 7:00 PM · Padi Paatu 8:15 PM · Harivarasanam 8:30 PM · Prasadham 8:45 PM.",
    ],
  },
  {
    icon: "cart-outline",
    tint: "#FCE4E6",
    title: "Items to Buy – Padi Pooja",
    subtitle: "Shopping list",
    points: [
      "Garlands: Ayyappa photo 4 ft, small vigraha 2 ft, Ganesha photo 3 ft, Muruga photo 3 ft, Gaja Stambam 3 ft.",
      "Loose flowers for Pooja, Archana and decoration: 5 kg.",
      "Turmeric powder 100 g · Chandan (sandalwood powder) 250 g · Kumkum 100 g · Bhasmam (viboothi) 500 g.",
      "Raw turmeric roots 100 · Betel (paan) leaves 100 · Dry dates 100 · Betel nuts 100 · Coins 100.",
      "Small green limes for garlands: 21 (make the lemon garland ahead of the Pooja).",
      "Mango leaves 2 lb · Coconuts 30 · Aval and pori (small bags of each) · Roasted dalia.",
      "Gingelly oil 1 big bottle · Long lamp wicks (1 thread from the pooja store) · Agarbathi 1 box · Smokeless camphor 4 boxes · Matchbox or lighter 4 · Tulasi leaves (if available).",
    ],
  },
  {
    icon: "cart-outline",
    tint: "#E4ECFB",
    title: "Items to Buy – Abhishekam",
    subtitle: "Shopping list",
    points: [
      "Milk 3 litres · Curd 1 big bottle · Ghee 1 big bottle · Honey 1 medium bottle · Brown sugar ½ lb.",
      "Sugarcane 4 small · Jaggery cubes 250 g · Seedless dates 2 boxes · Pomegranate 2 · Rose water 1 small.",
      "Vasthuram (thundu) for the small moorthy 1 · Vasthuram for Gajasthabam 1.",
      "Tender coconut with shell 2 · Dry coconuts 12 · Almonds and cashews (medium packet each).",
    ],
  },
  {
    icon: "clipboard-outline",
    tint: "#F0E6FA",
    title: "Items Needed from the Temple",
    subtitle: "Make 2 copies of the list; check items out and in",
    points: [
      "Pooja items: 18 small Kalasham pots (threaded) · 6 medium Kalasham pots · 1 Yeka harati · 34 Padi lamps · 2 Padi 18 peacock lamps · 1 big Kalasham for Murugan (threaded) · 1 Kommu chambu · 1 Trikanni (3-in-1 Ayyappa lamp).",
      "2 XL deepapu kundi · 1 XXL deepapu kundi · 1 Pancha harathi · 1 XL plate · 1 L plate · 1 wooden abhishekam table · 1 Karpura harathi · 1 abhishekam plate · 18 karpuram ginnelu.",
      "1 abhishekapatra stockpot · 1 panchamrutam stockpot · 4 wooden petalu for Guru Swamy · 1 back seat support for Guru Swamy · 3 wooden frame supports for photos.",
      "1 Padi · 3 photos (Ganesha, Ayyappa, Muruga) · 1 table 3×6 · 1 bell · 3 stones · 3 wooden blocks.",
      "Audio system: 2 big EV speakers with stand and power cables · 3 mikes · 6 coloured mike wires · 1 mixer with power cable · 1 mixer case.",
    ],
  },
  {
    icon: "help-circle-outline",
    tint: "#FFF1DA",
    title: "FAQs",
    subtitle: "Common questions",
    points: [
      "What is Home Padi Pooja? A sacred ritual conducted in the homes of Ayyappa devotees during Mandala Kalam, excluding Saturdays and major event days.",
      "Who can host? Ayyappa Swamies who are on dheeksha.",
      "How do I reserve a slot? Through the temple website or by contacting Guruswami Ravi garu.",
      "Any day restrictions? Monday to Friday and Sunday only. Some weekdays may be unavailable because of temple events or special occasions.",
      "Any food restrictions on the Pooja day? Food must be vegetarian, without onion and garlic.",
    ],
  },
];

/** Home Padi Pooja guidelines (no hero/scroll wrapper) for the Guidelines tab. */
export default function HomePadiGuidelines() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <View style={s.intro}>
        <View style={[s.circle, { backgroundColor: colors.maroonSoft }]}>
          <Icon name="home-outline" size={24} color={colors.saffron} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.introTitle}>{INTRO.title}</Text>
          <Text style={s.body}>{INTRO.body}</Text>
        </View>
      </View>

      <View style={s.register}>
        <View style={[s.circle, { backgroundColor: colors.surface }]}>
          <Icon name="calendar-outline" size={22} color={colors.saffron} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.registerTitle}>{BOOKING.title}</Text>
          <Text style={s.registerBody}>{BOOKING.body}</Text>
          <View style={s.reminder}>
            <Icon name="call-outline" size={15} color={colors.maroon} />
            <Text style={s.reminderText}>{BOOKING.guru}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("HomePadiPuja")}
            style={({ pressed }) => [s.registerButton, pressed && { opacity: 0.75 }]}
          >
            <Text style={s.registerButtonText}>{BOOKING.buttonLabel}</Text>
            <Icon name="chevron-forward" size={16} color={colors.cream} />
          </Pressable>
        </View>
      </View>

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
                    <Text style={s.pointText}>{point}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}

      <View style={s.note}>
        <Icon name="information-circle" size={26} color="#2F6FD1" />
        <View style={{ flex: 1 }}>
          <Text style={s.noteTitle}>Important Note</Text>
          <Text style={s.noteBody}>
            Source: Home Padi Pooja Booklet, Atlanta Ayyappa Temple, 5910 Bethelview Road,
            Cumming, GA 30040. For questions, please contact Guruswami or the temple office.
          </Text>
        </View>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  intro: { flexDirection: "row", gap: 14, marginBottom: 16 },
  introTitle: { color: colors.maroon, fontSize: 18, fontWeight: "700", marginBottom: 6 },
  body: { color: colors.text, fontSize: 13, lineHeight: 20 },
  register: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: colors.maroonSoft,
    borderWidth: 1,
    borderColor: colors.goldFill,
  },
  registerTitle: { color: colors.maroon, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  registerBody: { color: colors.text, fontSize: 12, lineHeight: 18 },
  reminder: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  reminderText: { flex: 1, color: colors.maroon, fontSize: 12, fontWeight: "600" },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.maroon,
  },
  registerButtonText: { color: colors.cream, fontSize: 14, fontWeight: "700" },
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
});
