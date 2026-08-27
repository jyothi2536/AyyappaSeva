import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  const {
    t,
    eventT,
    isAdmin,
    cloudConfigured,
    cloudConnected,
    authenticateAdmin,
    leaveAdmin,
    publishUpdate,
    uploadSong,
  } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const auth = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Enter the administrator email and password.");
      return;
    }
    setSigningIn(true);
    try {
      await authenticateAdmin(email.trim(), password);
    } catch (reason) {
      Alert.alert(
        "Unable to sign in",
        reason instanceof Error ? reason.message : "Please check the account details.",
      );
    } finally {
      setSigningIn(false);
    }
  };
  const publish = async () => {
    if (!title.trim() || !body.trim())
      return Alert.alert("Add a title and message.");
    try {
      await publishUpdate(title.trim(), body.trim());
      navigation.navigate("MainTabs", { screen: "Updates" });
    } catch (reason) {
      Alert.alert(
        "Unable to publish",
        reason instanceof Error ? reason.message : "Please try again.",
      );
    }
  };
  return (
    <Page>
      <BackButton navigation={navigation} label={t.profile} />
      <ScreenHeader
        eyebrow="AUTHORIZED STAFF"
        title={t.admin}
        subtitle={t.adminSub}
      />
      <View style={[s.cloud, cloudConnected && s.cloudConnected]}>
        <Icon
          name={cloudConnected ? "cloud-done" : "cloud-offline-outline"}
          color={cloudConnected ? "#91BE91" : "#D4A65A"}
        />
        <Text style={s.cloudText}>
          {cloudConnected
            ? "Shared database connected"
            : cloudConfigured
              ? "Connecting to shared database…"
              : "Firebase setup required"}
        </Text>
      </View>
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
          <Label text="Administrator email" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={s.input}
          />
          <Label text="Password" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={s.input}
          />
          <GoldButton
            label={signingIn ? "Signing in…" : t.continue}
            icon="shield-checkmark"
            onPress={auth}
          />
        </>
      ) : (
        <>
          <View style={s.ready}>
            <Icon name="checkmark-circle" color="#91BE91" />
            <Text style={s.readyText}>Verified temple administrator</Text>
          </View>
          <Text style={s.section}>{eventT.manageSchedule}</Text>
          <AdminAction
            icon="business"
            title={eventT.createTempleEvent}
            subtitle={eventT.templeEvents}
            onPress={() => navigation.navigate("AdminTempleEvent")}
          />
          <AdminAction
            icon="home"
            title={eventT.createPadiPuja}
            subtitle={eventT.padiPujas}
            onPress={() => navigation.navigate("AdminPadiPuja")}
          />
          <AdminAction
            icon="calendar"
            title={eventT.adminCalendar}
            subtitle={eventT.calendarSubtitle}
            onPress={() => navigation.navigate("AdminCalendar")}
          />
          <Text style={s.localNote}>{eventT.scheduleNote}</Text>
          <Text style={s.section}>{eventT.announcements}</Text>
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
          <Text style={s.section}>{t.documents}</Text>
          <View style={s.documentCard}>
            <View style={s.documentIcon}>
              <Icon name="documents" color={colors.gold} size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.documentTitle}>{t.addSong}</Text>
              <Text style={s.documentSub}>{t.documentsSub}</Text>
            </View>
          </View>
          <GoldButton
            label={t.chooseDocument}
            icon="document-attach"
            onPress={uploadSong}
            secondary
          />
          <Text style={s.localNote}>{t.localDocumentsNote}</Text>
          <View style={{ height: 12 }} />
          <GoldButton
            label="Sign out of admin"
            icon="log-out-outline"
            onPress={() => void leaveAdmin()}
            secondary
          />
        </>
      )}
    </Page>
  );
}
function AdminAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.action} onPress={onPress}>
      <View style={s.actionIcon}>
        <Icon name={icon} color={colors.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.actionTitle}>{title}</Text>
        <Text style={s.actionSub}>{subtitle}</Text>
      </View>
      <Icon name="chevron-forward" color={colors.gold} />
    </Pressable>
  );
}
function Label({ text }: { text: string }) {
  return <Text style={s.label}>{text}</Text>;
}
const s = StyleSheet.create({
  cloud: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212,166,90,.3)",
    backgroundColor: "rgba(212,166,90,.08)",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 16,
  },
  cloudConnected: {
    borderColor: "rgba(145,190,145,.3)",
    backgroundColor: "rgba(145,190,145,.08)",
  },
  cloudText: { color: colors.cream, fontSize: 11, fontWeight: "700" },
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
  section: {
    color: colors.cream,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 11,
  },
  action: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 9,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(233,185,73,.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { color: colors.cream, fontSize: 13, fontWeight: "800" },
  actionSub: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  localNote: { color: "#7D7662", fontSize: 9, lineHeight: 14, marginBottom: 16 },
  documentCard: {
    minHeight: 82,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  documentIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(233,185,73,.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  documentTitle: { color: colors.cream, fontSize: 14, fontWeight: "800" },
  documentSub: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4 },
});
