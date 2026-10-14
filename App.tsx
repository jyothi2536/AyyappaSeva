import "./src/themeRuntime";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Montserrat_100Thin,
  Montserrat_200ExtraLight,
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_400Regular_Italic,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_600SemiBold_Italic,
  Montserrat_700Bold,
  Montserrat_700Bold_Italic,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from "@expo-google-fonts/montserrat";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Icon } from "./src/components/UI";
import AppNavigator from "./src/navigation/AppNavigator";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { AppProvider, useApp } from "./src/state/AppContext";
import { colors } from "./src/theme";

function AppContent() {
  const { storageReady, onboardingComplete, themeMode } = useApp();
  const statusStyle = themeMode === "dark" ? "light" : "dark";
  const [launchWelcomeComplete, setLaunchWelcomeComplete] = useState(false);
  const completeLaunchWelcome = useCallback(
    () => setLaunchWelcomeComplete(true),
    [],
  );
  if (!storageReady)
    return (
      <View style={styles.loading}>
        <StatusBar style={statusStyle} />
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
      <StatusBar style={statusStyle} />
      {/* Remount on theme change so every screen re-reads the theme colours. */}
      <AppNavigator key={themeMode} />
    </>
  );
}
export default function App() {
  const [iconsLoaded, iconsError] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    Montserrat_100Thin,
    Montserrat_200ExtraLight,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_400Regular_Italic,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_600SemiBold_Italic,
    Montserrat_700Bold,
    Montserrat_700Bold_Italic,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });

  if (!iconsLoaded && !iconsError) {
    return (
      <View style={styles.loading}>
        <StatusBar style="dark" />
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
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingMark: {
    color: colors.gold,
    fontSize: 34,
  },
});
