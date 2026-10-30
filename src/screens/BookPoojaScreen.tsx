import React, { useEffect, useRef } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton, Icon, Page, ScreenHeader } from "../components/UI";
import { useDevotee } from "../services/devotee";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

/** Placeholder — booking form will be designed next. */
export default function BookPoojaScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "BookPooja">) {
  const devotee = useDevotee();
  const wasSignedIn = useRef(false);
  useEffect(() => {
    if (devotee) wasSignedIn.current = true;
    else if (wasSignedIn.current) {
      wasSignedIn.current = false;
      Alert.alert("Session ended", "You were signed out after 1 hour. Please sign in again.");
      navigation.replace("DevoteeLogin", { next: "BookPooja" });
    }
  }, [devotee, navigation]);
  return (
    <Page>
      <BackButton navigation={navigation} />
      <ScreenHeader
        eyebrow="SEVA & OFFERINGS"
        title="Book a Pooja"
        subtitle={devotee ? `Signed in as ${devotee.username}` : undefined}
      />
      <View style={s.card}>
        <Icon name="create-outline" size={30} color={colors.saffron} />
        <Text style={s.text}>Pooja booking is coming soon.</Text>
      </View>
      {/* Sign out is hidden for now; restore this button when booking goes live.
      <View style={{ height: 16 }} />
      <GoldButton
        secondary
        label="Sign out"
        icon="log-out-outline"
        onPress={() => {
          wasSignedIn.current = false;
          void signOutDevotee().then(() => navigation.goBack());
        }}
      />
      */}
    </Page>
  );
}

const s = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 28,
  },
  text: { color: colors.muted, fontSize: 14, textAlign: "center" },
});
