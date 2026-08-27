import React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "../components/UI";
import { useApp } from "../state/AppContext";
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
import RegistrationScreen from "../screens/RegistrationScreen";
import AdminScreen from "../screens/AdminScreen";
import AdminTempleEventScreen from "../screens/AdminTempleEventScreen";
import AdminPadiPujaScreen from "../screens/AdminPadiPujaScreen";
import AdminCalendarScreen from "../screens/AdminCalendarScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const icons: Record<
  keyof TabParamList,
  {
    active: React.ComponentProps<typeof Icon>["name"];
    inactive: React.ComponentProps<typeof Icon>["name"];
  }
> = {
  Home: { active: "home", inactive: "home-outline" },
  Songs: { active: "musical-notes", inactive: "musical-notes-outline" },
  Updates: { active: "notifications", inactive: "notifications-outline" },
  Temple: { active: "business", inactive: "business-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};
function MainTabs() {
  const { t, eventT } = useApp();
  const labels: Record<keyof TabParamList, string> = {
    Home: t.home,
    Songs: t.songs,
    Updates: eventT.events,
    Temple: t.temple,
    Profile: t.profile,
  };
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabel: labels[route.name],
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: s.tabBar,
        tabBarLabelStyle: s.tabLabel,
        tabBarIcon: ({ focused }) => (
          <View style={[s.iconWrap, focused && s.iconActive]}>
            <Icon
              name={
                focused ? icons[route.name].active : icons[route.name].inactive
              }
              size={20}
              color={focused ? colors.ink : colors.muted}
            />
          </View>
        ),
      })}
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
  return (
    <NavigationContainer
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
          contentStyle: { backgroundColor: colors.ink },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Downloads" component={DownloadsScreen} />
        <Stack.Screen name="Wallpapers" component={WallpapersScreen} />
        <Stack.Screen name="Scriptures" component={ScripturesScreen} />
        <Stack.Screen name="Harivarasanam" component={HarivarasanamScreen} />
        <Stack.Screen name="Lyrics" component={LyricsScreen} />
        <Stack.Screen name="DocumentReader" component={DocumentReaderScreen} />
        <Stack.Group
          screenOptions={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        >
          <Stack.Screen name="Registration" component={RegistrationScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen
            name="AdminTempleEvent"
            component={AdminTempleEventScreen}
          />
          <Stack.Screen name="AdminPadiPuja" component={AdminPadiPujaScreen} />
          <Stack.Screen name="AdminCalendar" component={AdminCalendarScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const s = StyleSheet.create({
  tabBar: {
    height: 76,
    paddingTop: 8,
    paddingBottom: 7,
    backgroundColor: "rgba(12,12,9,.98)",
    borderTopColor: colors.line,
  },
  tabLabel: { fontSize: 9, fontWeight: "700" },
  iconWrap: {
    width: 38,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  iconActive: { backgroundColor: colors.gold },
});
