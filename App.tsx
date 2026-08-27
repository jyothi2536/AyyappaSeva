import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Icon } from "./src/components/UI";
import AppNavigator from "./src/navigation/AppNavigator";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { AppProvider, useApp } from "./src/state/AppContext";
import { colors } from "./src/theme";

function AppContent() {
  const { storageReady, onboardingComplete } = useApp();
  const [launchWelcomeComplete, setLaunchWelcomeComplete] = useState(false);
  const completeLaunchWelcome = useCallback(
    () => setLaunchWelcomeComplete(true),
    [],
  );
  if (!storageReady)
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <Icon name="flame" size={34} color={colors.gold} />
      </View>
    );
  if (!launchWelcomeComplete)
    return (
      <OnboardingScreen
        returning={onboardingComplete}
        onComplete={completeLaunchWelcome}
      />
    );
  if (!onboardingComplete) return <OnboardingScreen />;
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
export default function App() {
  const [iconsLoaded, iconsError] = useFonts(Ionicons.font);

  if (!iconsLoaded && !iconsError) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <Text style={styles.loadingMark}>◆</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingMark: {
    color: colors.gold,
    fontSize: 34,
  },
});
