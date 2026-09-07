import { Animated, Easing } from "react-native";
import { PETAL_SHOWER_DURATION } from "./petalShowerMotion";

type WelcomeRevealOptions = {
  left: Animated.Value;
  right: Animated.Value;
  petals: Animated.Value;
  width: number;
  reduceMotion: boolean;
  returning: boolean;
  onPetalsVisible: (visible: boolean) => void;
  onComplete: () => void;
};

export function startWelcomeReveal({
  left,
  right,
  petals,
  width,
  reduceMotion,
  returning,
  onPetalsVisible,
  onComplete,
}: WelcomeRevealOptions) {
  let cancelled = false;
  let completionTimer: ReturnType<typeof setTimeout> | undefined;
  let doors: Animated.CompositeAnimation | undefined;
  let shower: Animated.CompositeAnimation | undefined;
  const distance = width / 2 + 12;
  onPetalsVisible(false);
  petals.setValue(0);

  const finish = (delay: number) => {
    if (!returning || cancelled) return;
    completionTimer = setTimeout(() => {
      if (!cancelled) onComplete();
    }, delay);
  };

  if (reduceMotion) {
    left.setValue(-distance);
    right.setValue(distance);
    finish(700);
  } else {
    left.setValue(0);
    right.setValue(0);
    doors = Animated.parallel([
      Animated.timing(left, { toValue: -distance, duration: 1800, useNativeDriver: true }),
      Animated.timing(right, { toValue: distance, duration: 1800, useNativeDriver: true }),
    ]);
    doors.start(({ finished }) => {
      if (!finished || cancelled) return;
      onPetalsVisible(true);
      shower = Animated.timing(petals, {
        toValue: 1,
        duration: PETAL_SHOWER_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      });
      shower.start(({ finished: showerFinished }) => {
        if (!showerFinished || cancelled) return;
        onPetalsVisible(false);
        finish(150);
      });
    });
  }

  // Leaving via Enter/Next, changing motion preference, and unmount all cancel.
  return () => {
    cancelled = true;
    doors?.stop();
    shower?.stop();
    if (completionTimer !== undefined) clearTimeout(completionTimer);
  };
}
