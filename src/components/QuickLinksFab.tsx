import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Icon, type IconName } from "./UI";
import { colors } from "../theme";

export type FabAction = { label: string; icon: IconName; mci?: string; onPress: () => void };

/** Floating "quick links" button: tap to fan out the actions above it. */
export default function QuickLinksFab({ actions, bottom = 16 }: { actions: FabAction[]; bottom?: number }) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, anim]);

  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "135deg"] });

  return (
    <>
      {/* Dim backdrop; tap anywhere to close. */}
      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[StyleSheet.absoluteFill, s.backdrop, { opacity: anim }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Close quick links" />
      </Animated.View>

      <View pointerEvents="box-none" style={[s.wrap, { bottom }]}>
        {actions.map((a, i) => {
          const fromEnd = actions.length - i;
          const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [16 * fromEnd, 0] });
          return (
            <Animated.View
              key={a.label}
              pointerEvents={open ? "auto" : "none"}
              style={{ opacity: anim, transform: [{ translateY }] }}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setOpen(false);
                  a.onPress();
                }}
                style={({ pressed }) => [s.item, pressed && { opacity: 0.8 }]}
              >
                <Text style={s.itemLabel}>{a.label}</Text>
                <View style={s.itemIcon}>
                  {a.mci ? (
                    <MaterialCommunityIcons name={a.mci as never} size={20} color={colors.maroon} />
                  ) : (
                    <Icon name={a.icon} size={20} color={colors.maroon} />
                  )}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={open ? "Close quick links" : "Open Deeksha quick links"}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((v) => !v)}
          style={({ pressed }) => [s.fab, pressed && { transform: [{ scale: 0.95 }] }]}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon name="add" size={30} color={colors.cream} />
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(20,10,5,0.45)" },
  wrap: { position: "absolute", right: 18, alignItems: "flex-end", gap: 12 },
  item: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemLabel: {
    backgroundColor: colors.surface,
    color: colors.maroon,
    fontWeight: "700",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  itemIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.maroonSoft,
    borderWidth: 1,
    borderColor: colors.goldFill,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
    elevation: 3,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.maroon,
    borderWidth: 2,
    borderColor: colors.goldFill,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
