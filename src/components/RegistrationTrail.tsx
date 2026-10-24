import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon } from "./UI";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;
export type RegistrationKind = "maladharana" | "irumudi";
type Step = "details" | "review";

const BRAND = "#7A1426";

/**
 * Breadcrumb trail + 2-step indicator for the Maladharana and Irumudi
 * registration flow. Every earlier crumb/step is tappable.
 */
export function RegistrationTrail({
  kind,
  step,
  navigation,
}: {
  kind: RegistrationKind;
  step: Step;
  navigation: Nav;
}) {
  const isIrumudi = kind === "irumudi";
  const formRoute = isIrumudi ? "IrumudiRegistration" : "Maladharana";
  const goDeeksha = () => navigation.popTo("MainTabs", { screen: "Deeksha" });
  const goIrumudi = () => navigation.popTo("Irumudi");
  const goForm = () => navigation.popTo(formRoute);

  const crumbs: { label: string; onPress?: () => void }[] = [
    { label: "Deeksha", onPress: goDeeksha },
    ...(isIrumudi ? [{ label: "Irumudi", onPress: goIrumudi }] : []),
    {
      label: isIrumudi ? "Registration" : "Maladharana",
      onPress: step === "review" ? goForm : undefined,
    },
    ...(step === "review" ? [{ label: "Review & Pay" }] : []),
  ];

  const steps: { id: Step; label: string; onPress?: () => void }[] = [
    { id: "details", label: "Details", onPress: step === "review" ? goForm : undefined },
    { id: "review", label: "Review & Pay" },
  ];
  const activeIndex = steps.findIndex((s) => s.id === step);

  return (
    <View style={s.wrap}>
      <View style={s.crumbs} accessibilityRole="header">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <View key={crumb.label} style={s.crumbItem}>
              {crumb.onPress && !last ? (
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Go to ${crumb.label}`}
                  hitSlop={8}
                  onPress={crumb.onPress}
                >
                  {({ pressed }) => (
                    <Text style={[s.crumbLink, pressed && { opacity: 0.6 }]}>{crumb.label}</Text>
                  )}
                </Pressable>
              ) : (
                <Text style={last ? s.crumbCurrent : s.crumbPlain}>{crumb.label}</Text>
              )}
              {!last ? <Icon name="chevron-forward" size={14} color={colors.muted} /> : null}
            </View>
          );
        })}
      </View>

      <Text style={s.title}>
        {isIrumudi ? "Irumudi Registration" : "Maladharana Registration"}
      </Text>

      <View style={s.stepper}>
        {steps.map((st, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          const circle = (
            <View style={[s.circle, (done || active) && s.circleOn]}>
              {done ? (
                <Icon name="checkmark" size={14} color="#fff" />
              ) : (
                <Text style={[s.circleText, active && { color: "#fff" }]}>{i + 1}</Text>
              )}
            </View>
          );
          return (
            <React.Fragment key={st.id}>
              {i > 0 ? <View style={[s.bar, i <= activeIndex && s.barOn]} /> : null}
              {st.onPress ? (
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Back to step ${i + 1}: ${st.label}`}
                  hitSlop={8}
                  onPress={st.onPress}
                  style={({ pressed }) => [s.step, pressed && { opacity: 0.6 }]}
                >
                  {circle}
                  <Text style={[s.stepLabel, s.stepLink]}>{st.label}</Text>
                </Pressable>
              ) : (
                <View style={s.step}>
                  {circle}
                  <Text style={[s.stepLabel, active && s.stepActive]}>{st.label}</Text>
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 18 },
  crumbs: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", rowGap: 4 },
  crumbItem: { flexDirection: "row", alignItems: "center", gap: 4, marginRight: 4 },
  crumbLink: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  crumbPlain: { color: colors.muted, fontSize: 13 },
  crumbCurrent: { color: colors.text, fontSize: 13, fontWeight: "600" },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "serif",
    marginTop: 10,
  },
  stepper: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  step: { flexDirection: "row", alignItems: "center", gap: 8 },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  circleOn: { backgroundColor: BRAND, borderColor: BRAND },
  circleText: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  stepLabel: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  stepActive: { color: colors.text, fontWeight: "800" },
  stepLink: { color: BRAND, textDecorationLine: "underline" },
  bar: { flex: 1, height: 2, marginHorizontal: 10, backgroundColor: colors.line },
  barOn: { backgroundColor: BRAND },
});
