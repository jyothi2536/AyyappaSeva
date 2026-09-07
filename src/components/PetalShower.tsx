import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { offeringPetals } from "./petalShowerMotion";

type PetalShowerProps = {
  progress: Animated.Value;
  width: number;
  height: number;
};

export default function PetalShower({ progress, width, height }: PetalShowerProps) {
  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {offeringPetals.map((petal) => {
        const middle = (petal.start + petal.end) / 2;
        const range = [petal.start, middle, petal.end];
        return (
          <Animated.View
            key={petal.id}
            style={[
              s.petal,
              {
                width: petal.size,
                height: petal.size * 1.45,
                opacity: progress.interpolate({
                  inputRange: [petal.start, petal.start + 0.07, petal.end - 0.12, petal.end],
                  outputRange: [0, 0.92, 0.85, 0],
                  extrapolate: "clamp",
                }),
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: range,
                      outputRange: [width * petal.startX, width * (petal.startX + petal.endX) / 2 + petal.sway, width * petal.endX],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    translateY: progress.interpolate({
                      inputRange: range,
                      outputRange: [-30, height * petal.endY * 0.42, height * petal.endY],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    rotate: progress.interpolate({
                      inputRange: range,
                      outputRange: [`${petal.rotation}deg`, `${petal.rotation + petal.turn * 0.4}deg`, `${petal.rotation + petal.turn}deg`],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    scaleX: progress.interpolate({
                      inputRange: range,
                      outputRange: [1, 0.5, 0.85],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={petal.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.petalShape}
            >
              <View style={s.fold} />
            </LinearGradient>
          </Animated.View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  petal: { position: "absolute", left: 0, top: 0 },
  petalShape: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 4,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255,239,213,.4)",
  },
  fold: {
    position: "absolute",
    left: "46%",
    top: "18%",
    bottom: "12%",
    width: 0.5,
    backgroundColor: "rgba(255,247,226,.5)",
    transform: [{ rotate: "18deg" }],
  },
});
