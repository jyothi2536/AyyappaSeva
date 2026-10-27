import React, { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Icon } from "./UI";
import { colors } from "../theme";

/** Admin control: shows the chosen photo (or an "Add photo" tile) with change/remove actions. */
export function PhotoField({
  uri,
  onPick,
  onRemove,
  busy,
  compact,
}: {
  uri?: string | null;
  onPick: () => void;
  onRemove: () => void;
  busy?: boolean;
  /** Small square tile, used inside list rows. */
  compact?: boolean;
}) {
  if (compact) {
    return uri ? (
      <View style={s.tileWrap}>
        <Pressable accessibilityRole="button" accessibilityLabel="Change photo" onPress={onPick}>
          <Image source={{ uri }} style={s.tile} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove photo"
          hitSlop={8}
          onPress={onRemove}
          style={s.tileRemove}
        >
          <Icon name="close" size={12} color="#fff" />
        </Pressable>
      </View>
    ) : (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add photo"
        disabled={busy}
        onPress={onPick}
        style={[s.tile, s.tileEmpty]}
      >
        <Icon name="image-outline" size={20} color={colors.gold} />
      </Pressable>
    );
  }
  return uri ? (
    <View>
      <Image source={{ uri }} style={s.preview} resizeMode="cover" />
      <View style={s.actions}>
        <Pressable accessibilityRole="button" onPress={onPick} style={s.action}>
          <Icon name="swap-horizontal" size={16} color={colors.gold} />
          <Text style={s.actionText}>Change photo</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onRemove} style={[s.action, s.actionDanger]}>
          <Icon name="trash-outline" size={16} color={colors.red} />
          <Text style={[s.actionText, { color: colors.red }]}>Remove</Text>
        </Pressable>
      </View>
    </View>
  ) : (
    <Pressable accessibilityRole="button" disabled={busy} onPress={onPick} style={s.add}>
      <Icon name="image-outline" size={26} color={colors.gold} />
      <Text style={s.addText}>Add a photo (optional)</Text>
    </Pressable>
  );
}

/** Tap-to-enlarge image. Renders nothing when there is no photo. */
export function PhotoThumb({
  uri,
  style,
  label,
}: {
  uri?: string;
  style?: ViewStyle | ViewStyle[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!uri) return null;
  return (
    <>
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={label ? `View photo: ${label}` : "View photo"}
        onPress={() => setOpen(true)}
      >
        <Image source={{ uri }} style={[s.thumb, style as object]} resizeMode="cover" />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.lightbox} onPress={() => setOpen(false)} accessibilityLabel="Close photo">
          <Image source={{ uri }} style={s.full} resizeMode="contain" />
          <View style={s.close}>
            <Icon name="close" size={22} color="#fff" />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  add: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 14,
  },
  addText: { color: colors.gold, fontWeight: "800", fontSize: 13 },
  preview: { width: "100%", height: 190, borderRadius: 14, backgroundColor: colors.surface },
  actions: { flexDirection: "row", gap: 10, marginTop: 10, marginBottom: 14 },
  action: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionDanger: { backgroundColor: colors.redSoft },
  actionText: { color: colors.gold, fontWeight: "800", fontSize: 12 },
  tileWrap: { width: 44, height: 44 },
  tile: { width: 44, height: 44, borderRadius: 10 },
  tileEmpty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  tileRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.surface },
  lightbox: { flex: 1, backgroundColor: "rgba(0,0,0,.92)", alignItems: "center", justifyContent: "center" },
  full: { width: "100%", height: "85%" },
  close: {
    position: "absolute",
    top: 54,
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});
