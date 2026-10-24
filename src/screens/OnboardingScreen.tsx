import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../components/UI";
import PetalShower from "../components/PetalShower";
import { startWelcomeReveal } from "../components/welcomeReveal";
import { TEMPLE, welcomeTempleImage } from "../data/content";
import { useApp } from "../state/AppContext";
import { colors } from "../theme";

type OnboardingScreenProps = {
  returning?: boolean;
  onComplete?: () => void;
};

export default function OnboardingScreen({
  returning = false,
  onComplete,
}: OnboardingScreenProps) {
  const { finishOnboarding } = useApp();
  const { width, height } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [petalsVisible, setPetalsVisible] = useState(false);
  const left = useRef(new Animated.Value(0)).current;
  const right = useRef(new Animated.Value(0)).current;
  const petals = useRef(new Animated.Value(0)).current;
  const completionRef = useRef(onComplete);
  completionRef.current = onComplete;
  useEffect(() => {
    let active = true;
    let preferenceChanged = false;
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      preferenceChanged = true;
      if (active) setReduceMotion(enabled);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active && !preferenceChanged) setReduceMotion(enabled);
    }).catch(() => {
      if (active && !preferenceChanged) setReduceMotion(true);
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    if (reduceMotion === null) return;
    return startWelcomeReveal({
      left, right, petals, width, reduceMotion, returning,
      onPetalsVisible: setPetalsVisible,
      onComplete: () => completionRef.current?.(),
    });
  }, [left, right, petals, width, reduceMotion, returning]);
  return (
    <View style={s.root}>
      <View style={[StyleSheet.absoluteFill, s.stage]}>
        <Image
          source={welcomeTempleImage}
          accessible
          accessibilityRole="header"
          accessibilityLabel={TEMPLE.name}
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          style={{
            width: Math.min(width - 32, height * 0.5),
            height: Math.min(width - 32, height * 0.5),
            marginTop: height * 0.1,
          }}
        />
        <LinearGradient
          colors={["transparent", "transparent", "rgba(0,0,0,.6)"]}
          style={StyleSheet.absoluteFill}
        />
        {petalsVisible && <PetalShower progress={petals} width={width} height={height} />}
        <View style={s.reveal}>
          {/* The temple name is part of the welcome artwork, so it isn't repeated here. */}
          <Text style={s.mantra}>Swamiye Saranam Ayyappa</Text>
          <Text style={s.subtitle}>
            Welcome to your sacred temple community
          </Text>
          <Pressable
            style={s.next}
            onPress={async () => {
              if (!returning) await finishOnboarding();
              onComplete?.();
            }}
          >
            <Text style={s.continueText}>{returning ? "Enter" : "Next"}</Text>
            <Icon name="arrow-forward" color={colors.ink} />
          </Pressable>
        </View>
      </View>
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
  root: { flex: 1, backgroundColor: colors.surface, overflow: "hidden" },
  door: { position: "absolute", top: 0, bottom: 0, width: "50.5%" },
  left: { left: 0 },
  right: { right: 0 },
  doorPanel: {
    flex: 1,
    borderColor: colors.muted,
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
    borderColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 54,
  },
  carving: {
    width: "100%",
    height: 138,
    borderWidth: 2,
    borderColor: colors.muted,
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
  // Deep maroon behind the circular artwork so its corners blend in.
  stage: { backgroundColor: colors.maroonDeep, alignItems: "center" },
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
    backgroundColor: colors.goldFill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  languagePage: { flex: 1, padding: 24, paddingTop: 70 },
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
  active: { backgroundColor: colors.goldFill },
  native: { color: colors.cream, fontSize: 18, fontWeight: "800" },
  label: { color: colors.muted, fontSize: 10, marginTop: 5 },
  continue: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.goldFill,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  continueText: { color: colors.ink, fontSize: 14, fontWeight: "900" },
});
