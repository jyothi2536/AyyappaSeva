import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Icon } from "./src/components/UI";
import AppNavigator from "./src/navigation/AppNavigator";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { AppProvider, useApp } from "./src/state/AppContext";
import { colors } from "./src/theme";

function AppContent() {
  const { storageReady, onboardingComplete } = useApp();
  if (!storageReady)
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <Icon name="flame" size={34} color={colors.gold} />
      </View>
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
});
