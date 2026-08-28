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
import { formatEventDate, localize } from "../data/events";
import type { CalendarEvent, RootStackParamList } from "../types";
import { colors } from "../theme";

export default function AdminScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Admin">) {
  const {
    t,
    eventT,
    events,
    language,
    isAdmin,
    adminSession,
    adminAccounts,
    cloudConfigured,
    cloudConnected,
    authenticateAdmin,
    leaveAdmin,
    deleteAdminAccount,
    publishUpdate,
    uploadSong,
    deleteCalendarEvent,
  } = useApp();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const auth = async () => {
    if (!username.trim() || !password) {
      Alert.alert("Enter the administrator username and password.");
      return;
    }
    setSigningIn(true);
    try {
      await authenticateAdmin(username.trim(), password);
    } catch (reason) {
      Alert.alert(
        "Unable to sign in",
        reason instanceof Error ? reason.message : "Please check the account details.",
      );
    } finally {
      setSigningIn(false);
    }
  };
  const confirmDeleteAdmin = (uid: string, displayName: string) => {
    Alert.alert(
      "Delete administrator?",
      `${displayName} will immediately lose access to the admin section.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteAdminAccount(uid).catch((reason) => {
              Alert.alert(
                "Unable to delete administrator",
                reason instanceof Error ? reason.message : "Please try again.",
              );
            });
          },
        },
      ],
    );
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
  const editEvent = (event: CalendarEvent) => {
    if (event.kind === "temple") {
      navigation.navigate("AdminTempleEvent", { eventId: event.id });
    } else {
      navigation.navigate("AdminPadiPuja", { eventId: event.id });
    }
  };
  const confirmDeleteEvent = (event: CalendarEvent) => {
    Alert.alert(
      localize(event.title, language),
      "Delete this event for all users?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteCalendarEvent(event.id).catch((reason) => {
              Alert.alert(
                "Unable to delete event",
                reason instanceof Error ? reason.message : "Please try again.",
              );
            });
          },
        },
      ],
    );
  };
  const scheduledEvents = [...events].sort((a, b) =>
    `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`),
  );
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
          <Label text="Administrator username" />
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            placeholder="Username"
            placeholderTextColor="#6F6A59"
            style={s.input}
          />
          <Label text="Password" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
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
            <Icon
              name={adminSession?.role === "superAdmin" ? "shield-checkmark" : "checkmark-circle"}
              color="#91BE91"
            />
            <View style={{ flex: 1 }}>
              <Text style={s.readyText}>
                {adminSession?.role === "superAdmin"
                  ? "Verified super administrator"
                  : "Verified temple administrator"}
              </Text>
              {adminSession ? (
                <Text style={s.signedInAs}>Signed in as {adminSession.username}</Text>
              ) : null}
            </View>
          </View>
          {adminSession?.role === "superAdmin" ? (
            <>
              <Text style={s.section}>Manage administrators</Text>
              <Text style={s.localNote}>
                Only the super administrator can remove another administrator's access.
              </Text>
              {adminAccounts
                .filter((account) => account.uid !== adminSession.uid)
                .map((account) => (
                  <View key={account.uid} style={s.adminAccount}>
                    <View style={s.actionIcon}>
                      <Icon name="person" color={colors.gold} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.actionTitle}>{account.displayName}</Text>
                      <Text style={s.actionSub}>@{account.username} · Administrator</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Delete administrator ${account.displayName}`}
                      hitSlop={10}
                      onPress={() => confirmDeleteAdmin(account.uid, account.displayName)}
                      style={s.deleteAdmin}
                    >
                      <Icon name="trash-outline" color="#E58A7B" />
                    </Pressable>
                  </View>
                ))}
              {adminAccounts.filter((account) => account.uid !== adminSession.uid).length === 0 ? (
                <Text style={s.emptyAdmins}>No other administrator accounts.</Text>
              ) : null}
            </>
          ) : null}
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
            subtitle={`${scheduledEvents.length} scheduled · ${eventT.calendarSubtitle}`}
            onPress={() => navigation.navigate("AdminCalendar")}
          />
          <Text style={s.localNote}>{eventT.scheduleNote}</Text>
          <Text style={s.section}>{eventT.upcoming}</Text>
          {scheduledEvents.length ? (
            scheduledEvents.map((event) => (
              <View key={event.id} style={s.eventCard}>
                <View
                  style={[
                    s.eventDate,
                    event.kind === "padiPuja" && s.padiPujaDate,
                  ]}
                >
                  <Text style={s.eventDay}>{event.date.slice(8, 10)}</Text>
                  <Icon
                    name={event.kind === "temple" ? "business" : "home"}
                    size={14}
                    color={colors.ink}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.eventKind}>
                    {event.kind === "temple" ? eventT.templeEvent : eventT.padiPuja}
                  </Text>
                  <Text style={s.eventTitle} numberOfLines={2}>
                    {localize(event.title, language)}
                  </Text>
                  <Text style={s.eventMeta}>
                    {formatEventDate(event, language)} · {event.startTime}
                  </Text>
                </View>
                <View style={s.eventButtons}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${eventT.editEvent}: ${localize(event.title, language)}`}
                    onPress={() => editEvent(event)}
                    style={s.editEvent}
                  >
                    <Icon name="create-outline" size={19} color={colors.gold} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${localize(event.title, language)}`}
                    onPress={() => confirmDeleteEvent(event)}
                    style={s.deleteEvent}
                  >
                    <Icon name="trash-outline" size={19} color="#E58A7B" />
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View style={s.noEvents}>
              <Icon name="calendar-clear-outline" color={colors.gold} />
              <Text style={s.noEventsText}>{eventT.noEvents}</Text>
            </View>
          )}
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
  signedInAs: { color: colors.muted, fontSize: 9, marginTop: 3 },
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
  adminAccount: {
    minHeight: 68,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 9,
  },
  deleteAdmin: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(229,138,123,.1)",
  },
  emptyAdmins: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
    paddingVertical: 16,
    marginBottom: 10,
  },
  eventCard: {
    minHeight: 82,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 9,
  },
  eventDate: {
    width: 46,
    height: 58,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  padiPujaDate: { backgroundColor: "#87AC87" },
  eventDay: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  eventKind: {
    color: colors.gold,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  eventTitle: { color: colors.cream, fontSize: 13, fontWeight: "800", marginTop: 3 },
  eventMeta: { color: colors.muted, fontSize: 9, marginTop: 4 },
  eventButtons: { gap: 5 },
  editEvent: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "rgba(233,185,73,.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteEvent: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "rgba(229,138,123,.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  noEvents: {
    minHeight: 72,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginBottom: 12,
  },
  noEventsText: { color: colors.muted, fontSize: 11 },
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
