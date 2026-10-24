import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "./UI";
import { colors } from "../theme";

export type Segment<K extends string> = { key: K; label: string; icon: IconName };

/** Two-or-more option toggle with a sliding gold pill. */
export default function SegmentedControl<K extends string>({
  segments,
  value,
  onChange,
}: {
  segments: Segment<K>[];
  value: K;
  onChange: (key: K) => void;
}) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, segments.findIndex((s) => s.key === value));
  const x = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    Animated.timing(x, {
      toValue: index,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [index, x]);

  const segW = width > 0 ? (width - PAD * 2) / segments.length : 0;

  return (
    <View
      accessibilityRole="tablist"
      style={s.track}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {segW > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            s.pill,
            {
              width: segW,
              transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, segW] }) }],
            },
          ]}
        />
      ) : null}
      {segments.map((seg) => {
        const active = seg.key === value;
        return (
          <Pressable
            key={seg.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(seg.key)}
            style={s.segment}
          >
            <Icon name={seg.icon} size={17} color={active ? colors.ink : colors.muted} />
            <Text style={[s.label, active && s.labelActive]} numberOfLines={1}>
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const PAD = 4;

const s = StyleSheet.create({
  track: {
    flexDirection: "row",
    padding: PAD,
    borderRadius: 16,
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  pill: {
    position: "absolute",
    top: PAD,
    bottom: PAD,
    left: PAD,
    borderRadius: 12,
    backgroundColor: colors.goldFill,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 11,
  },
  label: { color: colors.muted, fontSize: 14, fontWeight: "700" },
  labelActive: { color: colors.ink, fontWeight: "800" },
});
