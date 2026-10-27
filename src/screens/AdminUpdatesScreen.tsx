import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton, GoldButton, Icon, Page, ScreenHeader } from "../components/UI";
import { PhotoField } from "../components/EventPhoto";
import { pickEventPhoto } from "../services/eventPhoto";
import {
  addTempleUpdate,
  deleteEventPhoto,
  editTempleUpdate,
  removeTempleUpdate,
  uploadEventPhoto,
  type PhotoRef,
} from "../services/firebase";
import { useApp } from "../state/AppContext";
import type { RootStackParamList, Update } from "../types";
import { colors } from "../theme";

export default function AdminUpdatesScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "AdminUpdates">) {
  const { t, isAdmin, cloudConfigured, updates } = useApp();
  const [editing, setEditing] = useState<Update | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  /** A newly picked photo that has not been uploaded yet. */
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  /** True when the admin removed the existing photo of the update being edited. */
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [saving, setSaving] = useState(false);

  const shownPhoto = localPhoto ?? (photoRemoved ? null : editing?.imageUrl ?? null);

  const reset = () => {
    setEditing(null);
    setTitle("");
    setBody("");
    setLocalPhoto(null);
    setPhotoRemoved(false);
  };
  const startEdit = (update: Update) => {
    setEditing(update);
    setTitle(update.title);
    setBody(update.body);
    setLocalPhoto(null);
    setPhotoRemoved(false);
  };
  const pick = async () => {
    try {
      const uri = await pickEventPhoto();
      if (uri) {
        setLocalPhoto(uri);
        setPhotoRemoved(false);
      }
    } catch (reason) {
      Alert.alert("Unable to open photos", reason instanceof Error ? reason.message : "Please try again.");
    }
  };

  const save = async () => {
    if (saving) return;
    if (!title.trim() || !body.trim()) return Alert.alert("Add a title and message.");
    setSaving(true);
    try {
      let photo: PhotoRef | null | undefined;
      if (localPhoto) photo = await uploadEventPhoto("updates", localPhoto);
      else if (editing && photoRemoved) photo = null;
      if (editing) {
        await editTempleUpdate(editing.id, title.trim(), body.trim(), photo);
        // The old photo is no longer used once replaced or removed.
        if (photo !== undefined) await deleteEventPhoto(editing.imagePath);
      } else {
        await addTempleUpdate(title.trim(), body.trim(), photo);
      }
      Alert.alert(editing ? "Update saved" : "Update published", "Devotees will see it in Latest Updates.");
      reset();
    } catch (reason) {
      Alert.alert("Unable to save", reason instanceof Error ? reason.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (update: Update) => {
    Alert.alert("Delete this update?", `"${update.title}" will be removed for everyone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void removeTempleUpdate(update)
            .then(() => {
              if (editing?.id === update.id) reset();
            })
            .catch((reason) =>
              Alert.alert("Unable to delete", reason instanceof Error ? reason.message : "Please try again."),
            );
        },
      },
    ]);
  };

  if (!isAdmin) {
    return (
      <Page>
        <BackButton navigation={navigation} label={t.admin} />
        <ScreenHeader eyebrow="ADMIN" title="Latest Updates" subtitle="Sign in as an administrator to edit." />
      </Page>
    );
  }

  return (
    <Page>
      <BackButton navigation={navigation} label={t.admin} />
      <ScreenHeader
        eyebrow="ANNOUNCEMENTS"
        title="Latest Updates"
        subtitle="Post news for devotees. Add a photo if you like. It appears on the Home page and in Events › Announcements."
      />
      {!cloudConfigured ? (
        <Text style={s.warn}>Firebase is not configured. Updates cannot be shared with devotees.</Text>
      ) : null}

      <Text style={s.section}>{editing ? "Edit update" : "New update"}</Text>
      <Text style={s.label}>{t.title}</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={colors.muted}
        style={s.input}
      />
      <Text style={s.label}>{t.message}</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        multiline
        placeholder="Message"
        placeholderTextColor={colors.muted}
        style={[s.input, s.multiline]}
      />
      <Text style={s.label}>Photo</Text>
      <PhotoField
        uri={shownPhoto}
        onPick={() => void pick()}
        onRemove={() => {
          setLocalPhoto(null);
          setPhotoRemoved(true);
        }}
      />
      {saving ? (
        <View style={s.saving}>
          <ActivityIndicator color={colors.gold} />
          <Text style={s.savingText}>{localPhoto ? "Uploading photo…" : "Saving…"}</Text>
        </View>
      ) : (
        <GoldButton label={editing ? "Save changes" : t.publish} icon="send" onPress={save} />
      )}
      {editing ? (
        <View style={{ marginTop: 10 }}>
          <GoldButton label="Cancel editing" secondary onPress={reset} />
        </View>
      ) : null}

      <Text style={s.section}>Published updates</Text>
      {updates.length === 0 ? <Text style={s.note}>No updates yet.</Text> : null}
      {updates.map((update) => (
        <View key={update.id} style={[s.card, editing?.id === update.id && s.cardActive]}>
          {update.imageUrl ? <Image source={{ uri: update.imageUrl }} style={s.cardImage} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle} numberOfLines={2}>
              {update.title}
            </Text>
            <Text style={s.cardBody} numberOfLines={2}>
              {update.body}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${update.title}`}
            hitSlop={8}
            onPress={() => startEdit(update)}
            style={s.iconBtn}
          >
            <Icon name="create-outline" size={19} color={colors.gold} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${update.title}`}
            hitSlop={8}
            onPress={() => confirmDelete(update)}
            style={[s.iconBtn, { backgroundColor: colors.redSoft }]}
          >
            <Icon name="trash-outline" size={19} color={colors.red} />
          </Pressable>
        </View>
      ))}
    </Page>
  );
}

const s = StyleSheet.create({
  warn: { color: colors.red, backgroundColor: colors.redSoft, padding: 12, borderRadius: 12, fontSize: 12, marginBottom: 8 },
  section: { color: colors.text, fontFamily: "serif", fontSize: 17, fontWeight: "700", marginTop: 20, marginBottom: 10 },
  note: { color: colors.muted, fontSize: 13 },
  label: { color: colors.muted, fontSize: 11, fontWeight: "700", marginBottom: 6, marginTop: 4 },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  multiline: { minHeight: 110, paddingTop: 12, textAlignVertical: "top" },
  saving: {
    height: 54,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  savingText: { color: colors.text, fontWeight: "800" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    marginBottom: 10,
  },
  cardActive: { borderColor: colors.goldFill, borderWidth: 2 },
  cardImage: { width: 54, height: 54, borderRadius: 10 },
  cardTitle: { color: colors.text, fontWeight: "800", fontSize: 14 },
  cardBody: { color: colors.muted, fontSize: 12, marginTop: 2 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.maroonSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
