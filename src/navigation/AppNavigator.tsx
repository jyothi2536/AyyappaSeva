import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  createNavigationContainerRef,
  DarkTheme,
  NavigationContainer,
  StackActions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppFooter, AppHeader, type AppTab } from "../components/AppChrome";
import type { RootStackParamList, TabParamList } from "../types";
import { colors } from "../theme";
import HomeScreen from "../screens/HomeScreen";
import SongsScreen from "../screens/SongsScreen";
import UpdatesScreen from "../screens/UpdatesScreen";
import TempleScreen from "../screens/TempleScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DownloadsScreen from "../screens/DownloadsScreen";
import WallpapersScreen from "../screens/WallpapersScreen";
import ScripturesScreen from "../screens/ScripturesScreen";
import HarivarasanamScreen from "../screens/HarivarasanamScreen";
import LyricsScreen from "../screens/LyricsScreen";
import DocumentReaderScreen from "../screens/DocumentReaderScreen";
import AdminScreen from "../screens/AdminScreen";
import AdminTempleEventScreen from "../screens/AdminTempleEventScreen";
import AdminPadiPujaScreen from "../screens/AdminPadiPujaScreen";
import AdminCalendarScreen from "../screens/AdminCalendarScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();
const tabNames: AppTab[] = ["Home", "Songs", "Updates", "Temple", "Profile"];
function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Songs" component={SongsScreen} />
      <Tabs.Screen name="Updates" component={UpdatesScreen} />
      <Tabs.Screen name="Temple" component={TempleScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}
export default function AppNavigator() {
  const [activeTab, setActiveTab] = useState<AppTab>("Home");
  const syncActiveTab = useCallback(() => {
    const currentRoute = navigationRef.getCurrentRoute()?.name;
    if (currentRoute && tabNames.includes(currentRoute as AppTab)) {
      setActiveTab(currentRoute as AppTab);
    }
  }, []);
  const navigateToTab = useCallback((tab: AppTab) => {
    setActiveTab(tab);
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.popTo("MainTabs", { screen: tab }));
    }
  }, []);
  return (
    <View style={s.shell}>
      <AppHeader onUpdates={() => navigateToTab("Updates")} />
      <View style={s.content}>
        <NavigationContainer
          ref={navigationRef}
          onReady={syncActiveTab}
          onStateChange={syncActiveTab}
          theme={{
            ...DarkTheme,
            colors: {
              ...DarkTheme.colors,
              background: colors.ink,
              card: colors.surface,
              text: colors.cream,
              border: colors.line,
              primary: colors.gold,
            },
          }}
        >
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              presentation: "card",
              contentStyle: { backgroundColor: colors.ink },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Downloads" component={DownloadsScreen} />
            <Stack.Screen name="Wallpapers" component={WallpapersScreen} />
            <Stack.Screen name="Scriptures" component={ScripturesScreen} />
            <Stack.Screen
              name="Harivarasanam"
              component={HarivarasanamScreen}
            />
            <Stack.Screen name="Lyrics" component={LyricsScreen} />
            <Stack.Screen
              name="DocumentReader"
              component={DocumentReaderScreen}
            />
            <Stack.Screen name="Admin" component={AdminScreen} />
            <Stack.Screen
              name="AdminTempleEvent"
              component={AdminTempleEventScreen}
            />
            <Stack.Screen
              name="AdminPadiPuja"
              component={AdminPadiPujaScreen}
            />
            <Stack.Screen
              name="AdminCalendar"
              component={AdminCalendarScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
      <AppFooter activeTab={activeTab} onNavigate={navigateToTab} />
    </View>
  );
}
const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.ink },
  content: { flex: 1 },
});
