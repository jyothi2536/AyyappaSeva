import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  BackButton,
  GoldButton,
  Icon,
  Page,
  ScreenHeader,
} from "../components/UI";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

export default function AdminScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Admin">) {
  const { t, isAdmin, authenticateAdmin, publishUpdate, uploadSong } = useApp();
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const auth = () =>
    code.trim().toUpperCase() === "SWAMI108"
      ? authenticateAdmin()
      : Alert.alert(
          "Invitation code not recognized",
          "For this prototype, use SWAMI108.",
        );
  const publish = () => {
    if (!title.trim() || !body.trim())
      return Alert.alert("Add a title and message.");
    publishUpdate(title.trim(), body.trim());
    navigation.navigate("MainTabs", { screen: "Updates" });
  };
  return (
    <Page>
      <BackButton navigation={navigation} label={t.profile} />
      <ScreenHeader
        eyebrow="AUTHORIZED STAFF"
        title={t.admin}
        subtitle={t.adminSub}
      />
      {!isAdmin ? (
        <>
          <View style={s.secure}>
            <Icon name="lock-closed" size={34} color={colors.gold} />
            <Text style={s.secureTitle}>Authorized temple staff only</Text>
            <Text style={s.meta}>
              Admin access requires an invitation issued by the temple
              committee.
            </Text>
          </View>
          <Label text={t.invitation} />
          <TextInput
            value={code}
            onChangeText={setCode}
            secureTextEntry
            style={s.input}
          />
          <GoldButton
            label={t.continue}
            icon="shield-checkmark"
            onPress={auth}
          />
          <Text style={s.hint}>Prototype code: SWAMI108</Text>
        </>
      ) : (
        <>
          <View style={s.ready}>
            <Icon name="checkmark-circle" color="#91BE91" />
            <Text style={s.readyText}>Verified temple administrator</Text>
          </View>
          <Label text={t.title} />
          <TextInput value={title} onChangeText={setTitle} style={s.input} />
          <Label text={t.message} />
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            style={[s.input, s.multiline]}
          />
          <GoldButton label={t.publish} icon="send" onPress={publish} />
          <View style={{ height: 12 }} />
          <GoldButton
            label={t.addSong}
            icon="cloud-upload"
            onPress={uploadSong}
            secondary
          />
        </>
      )}
    </Page>
  );
}
function Label({ text }: { text: string }) {
  return <Text style={s.label}>{text}</Text>;
}
const s = StyleSheet.create({
  secure: {
    alignItems: "center",
    backgroundColor: "#201B11",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
    marginBottom: 24,
  },
  secureTitle: {
    color: colors.cream,
    fontWeight: "800",
    fontSize: 16,
    marginTop: 13,
  },
  meta: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 5,
  },
  label: { color: "#C4BFAF", fontSize: 11, fontWeight: "700", marginBottom: 7 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.cream,
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 15,
  },
  multiline: { height: 130, paddingTop: 14, textAlignVertical: "top" },
  hint: { color: "#6F6A59", fontSize: 10, textAlign: "center", marginTop: 15 },
  ready: {
    backgroundColor: "rgba(72,99,70,.2)",
    padding: 13,
    borderRadius: 14,
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    marginBottom: 20,
  },
  readyText: { color: "#A6C6A4", fontSize: 12, fontWeight: "700" },
});
