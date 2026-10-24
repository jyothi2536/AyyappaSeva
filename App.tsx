import "./src/themeRuntime";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// Import each weight on its own path: the package index bundles all 18 files.
import { Montserrat_100Thin } from "@expo-google-fonts/montserrat/100Thin";
import { Montserrat_200ExtraLight } from "@expo-google-fonts/montserrat/200ExtraLight";
import { Montserrat_300Light } from "@expo-google-fonts/montserrat/300Light";
import { Montserrat_400Regular } from "@expo-google-fonts/montserrat/400Regular";
import { Montserrat_400Regular_Italic } from "@expo-google-fonts/montserrat/400Regular_Italic";
import { Montserrat_500Medium } from "@expo-google-fonts/montserrat/500Medium";
import { Montserrat_600SemiBold } from "@expo-google-fonts/montserrat/600SemiBold";
import { Montserrat_600SemiBold_Italic } from "@expo-google-fonts/montserrat/600SemiBold_Italic";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat/700Bold";
import { Montserrat_700Bold_Italic } from "@expo-google-fonts/montserrat/700Bold_Italic";
import { Montserrat_800ExtraBold } from "@expo-google-fonts/montserrat/800ExtraBold";
import { Montserrat_900Black } from "@expo-google-fonts/montserrat/900Black";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Icon } from "./src/components/UI";
import AppNavigator from "./src/navigation/AppNavigator";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { AppProvider, useApp } from "./src/state/AppContext";
import { builtInDocuments } from "./src/data/content";
import { prepareAllBuiltInDocuments } from "./src/services/documents";
import { colors } from "./src/theme";

function AppContent() {
  const { storageReady, onboardingComplete, themeMode } = useApp();
  const statusStyle = themeMode === "dark" ? "light" : "dark";
  const [launchWelcomeComplete, setLaunchWelcomeComplete] = useState(false);
  // Books are always ready to read: prepare them quietly in the background.
  useEffect(() => {
    if (storageReady) void prepareAllBuiltInDocuments(builtInDocuments);
  }, [storageReady]);
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
