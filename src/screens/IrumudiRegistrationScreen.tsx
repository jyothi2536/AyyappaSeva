import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BackButton, Icon, Page, ScreenHeader } from "../components/UI";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

// Placeholder — the Irumudi registration form is still to be designed.
export default function IrumudiRegistrationScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Page>
      <BackButton navigation={navigation} compact />
      <ScreenHeader eyebrow="Irumudi" title="Irumudi Registration" />
      <View style={s.box}>
        <Icon name="construct-outline" size={28} color={colors.saffron} />
        <Text style={s.text}>
          Online Irumudi registration is coming soon. Please contact the Temple
          Irumudi Coordinator to register.
        </Text>
      </View>
    </Page>
  );
}

const s = StyleSheet.create({
  box: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFF1DA",
  },
  text: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },
});
