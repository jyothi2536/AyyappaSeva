import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../components/UI";
import { languages, onboardingCopy, wallpapers } from "../data/content";
import { useApp } from "../state/AppContext";
import type { Language } from "../types";
import { colors } from "../theme";

export default function OnboardingScreen() {
  const { finishOnboarding } = useApp();
  const [stage, setStage] = useState<"doors" | "language">("doors");
  const [selected, setSelected] = useState<Language>("en");
  const left = useRef(new Animated.Value(0)).current;
  const right = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(left, {
        toValue: -230,
        duration: 1800,
        useNativeDriver: true,
      }),
      Animated.timing(right, {
        toValue: 230,
        duration: 1800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [left, right]);
  if (stage === "language") {
    const copy = onboardingCopy[selected];
    return (
      <LinearGradient colors={["#090906", "#19160F"]} style={s.root}>
        <SafeAreaView style={s.languagePage}>
          <Text style={s.eyebrow}>AYYAPPA SEVA</Text>
          <Text style={s.title}>{copy.choose}</Text>
          <Text style={s.subtitle}>{copy.chooseSub}</Text>
          <View style={s.grid}>
            {languages.map((item) => {
              const active = item.id === selected;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelected(item.id)}
                  style={[s.language, active && s.active]}
                >
                  <Text style={[s.native, active && { color: colors.ink }]}>
                    {item.native}
                  </Text>
                  <Text style={[s.label, active && { color: "#67480D" }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={s.continue}
            onPress={() => finishOnboarding(selected)}
          >
            <Text style={s.continueText}>{copy.continue}</Text>
            <Icon name="arrow-forward" color={colors.ink} />
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    );
  }
  return (
    <View style={s.root}>
      <ImageBackground
        source={wallpapers[0].source}
        style={StyleSheet.absoluteFill}
        imageStyle={{ resizeMode: "cover" }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,.08)", "transparent", "rgba(0,0,0,.88)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.reveal}>
          <Text style={s.mantra}>Swamiye Saranam Ayyappa</Text>
          <Text style={s.subtitle}>
            Welcome to your sacred temple community
          </Text>
          <Pressable style={s.next} onPress={() => setStage("language")}>
            <Text style={s.continueText}>Next</Text>
            <Icon name="arrow-forward" color={colors.ink} />
          </Pressable>
        </View>
      </ImageBackground>
      <Animated.View
        pointerEvents="none"
        style={[s.door, s.left, { transform: [{ translateX: left }] }]}
      >
        <Door />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[s.door, s.right, { transform: [{ translateX: right }] }]}
      >
        <Door />
      </Animated.View>
    </View>
  );
}
function Door() {
  return (
    <LinearGradient
      colors={["#1A0A04", "#522510", "#210E06"]}
      style={s.doorPanel}
    >
      <View style={s.arch}>
        <Icon name="flower-outline" size={45} color="#B97A28" />
      </View>
      {[0, 1, 2].map((i) => (
        <View key={i} style={s.carving}>
          <Icon
            name={i === 1 ? "flame" : "diamond-outline"}
            size={31}
            color="#B97A28"
          />
        </View>
      ))}
    </LinearGradient>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050402", overflow: "hidden" },
  door: { position: "absolute", top: 0, bottom: 0, width: "50.5%" },
  left: { left: 0 },
  right: { right: 0 },
  doorPanel: {
    flex: 1,
    borderColor: "#A96D24",
    borderWidth: 2,
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 64,
  },
  arch: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 2,
    borderColor: "#7F4C1B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 54,
  },
  carving: {
    width: "100%",
    height: 138,
    borderWidth: 2,
    borderColor: "#815020",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  reveal: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 48,
    alignItems: "center",
  },
  mantra: {
    color: "#FFF6DE",
    fontSize: 27,
    lineHeight: 34,
    textAlign: "center",
    fontWeight: "900",
  },
  subtitle: {
    color: "#D6C9AA",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 22,
    textAlign: "center",
    lineHeight: 18,
  },
  next: {
    height: 54,
    minWidth: 170,
    borderRadius: 27,
    paddingHorizontal: 26,
    backgroundColor: colors.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  languagePage: { flex: 1, padding: 24, paddingTop: 70 },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "900",
  },
  title: {
    color: colors.cream,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 15,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 24 },
  language: {
    width: "48%",
    borderRadius: 18,
    padding: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  active: { backgroundColor: colors.gold },
  native: { color: colors.cream, fontSize: 18, fontWeight: "800" },
  label: { color: colors.muted, fontSize: 10, marginTop: 5 },
  continue: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.gold,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  continueText: { color: colors.ink, fontSize: 14, fontWeight: "900" },
});
