import React, { useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Icon, Page, ScreenHeader } from "../components/UI";
import { colors } from "../theme";

/** Temple's Home Padi Puja booking site (Google Sites). */
export const PADI_PUJA_BOOKING_URL = "https://sites.google.com/view/atlanta-ayyappa-padipooja";
/** The Apps Script booking app the Google Site embeds (mobile-sized, full screen). */
export const PADI_PUJA_APP_URL =
  "https://script.google.com/macros/s/AKfycbwNgXjR-C0zN_KWR0cq6V_zaw_3SfAI-TCazg_W8dq1OvYqIpBuG8udca1gKAKPwGyi/exec";

/**
 * The booking app runs inside Google's sandboxed iframes and submits through
 * google.script.run, which the embedded WebView does not support reliably.
 * Opening it in the system in-app browser (Safari View Controller / Chrome
 * Custom Tab) gives the full browser engine while keeping the user in the app.
 */
async function openBooking() {
  try {
    await WebBrowser.openBrowserAsync(PADI_PUJA_APP_URL, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: colors.maroon,
      toolbarColor: colors.surface,
      dismissButtonStyle: "done",
      enableBarCollapsing: true,
    });
  } catch {
    await Linking.openURL(PADI_PUJA_APP_URL);
  }
}

const STEPS = [
  { icon: "calendar-outline" as const, text: "Tap a green date on the calendar (Sundays have morning and evening slots)." },
  { icon: "create-outline" as const, text: "Enter your name, phone, email and full home address with ZIP code." },
  { icon: "checkmark-circle-outline" as const, text: "Confirm the requirement and tap Send request." },
  { icon: "mail-outline" as const, text: "The temple reviews your request and confirms by email." },
];

export default function HomePadiPujaScreen() {
  const [opening, setOpening] = useState(false);
  const open = async () => {
    setOpening(true);
    try {
      await openBooking();
    } finally {
      setOpening(false);
    }
  };

  return (
    <Page>
      <ScreenHeader
        eyebrow="Deeksha"
        title="Book Home Padi Puja"
        subtitle="Invite the temple priest to perform the sacred Padi Puja at your home during the Mandala season."
      />

      <View style={s.card}>
        <View style={s.badge}>
          <Icon name="home-outline" size={26} color={colors.maroon} />
        </View>
        <Text style={s.title}>Check availability & request a date</Text>
        <Pressable
          accessibilityRole="button"
          disabled={opening}
          onPress={() => void open()}
          style={({ pressed }) => [s.button, (pressed || opening) && { opacity: 0.8 }]}
        >
          {opening ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <Text style={s.buttonText}>OPEN BOOKING CALENDAR</Text>
          )}
        </Pressable>
      </View>

      <Text style={s.howTitle}>How to book</Text>
      <View style={s.steps}>
        {STEPS.map((step, i) => (
          <View key={i} style={s.step}>
            <View style={s.num}>
              <Text style={s.numText}>{i + 1}</Text>
            </View>
            <Text style={s.stepText}>{step.text}</Text>
          </View>
        ))}
      </View>

      <View style={s.note}>
        <Icon name="information-circle" size={22} color={colors.gold} />
        <Text style={s.noteText}>
          Hosts must have attended at least three home Padi Poojas in full before hosting, as required by the temple.
        </Text>
      </View>
    </Page>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.maroonSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: colors.maroon, fontSize: 18, fontWeight: "800", textAlign: "center" },
  button: {
    alignSelf: "stretch",
    backgroundColor: colors.goldFill,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  buttonText: { color: colors.ink, fontWeight: "800", letterSpacing: 0.8 },
  howTitle: { color: colors.maroon, fontSize: 17, fontWeight: "800", marginTop: 24, marginBottom: 10 },
  steps: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 14,
  },
  step: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  num: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#7A1426",
    alignItems: "center",
    justifyContent: "center",
  },
  numText: { color: colors.cream, fontWeight: "800", fontSize: 13 },
  stepText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },
  note: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.raised,
    alignItems: "flex-start",
  },
  noteText: { flex: 1, color: colors.muted, fontSize: 13, lineHeight: 19 },
});
