import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import {
  createNavigationContainerRef,
  DarkTheme,
  NavigationContainer,
  StackActions,
  useIsFocused,
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

function withScreenMotion<Props extends object>(Screen: React.ComponentType<Props>) {
  return function MotionScreen(props: Props) {
    const isFocused = useIsFocused();
    const progress = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.timing(progress, {
        toValue: isFocused ? 1 : 0,
        duration: isFocused ? 240 : 140,
        easing: isFocused ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    }, [isFocused, progress]);

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.94, 1],
    });
    const translateY = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 0],
    });
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.985, 1],
    });

    return (
      <Animated.View
        style={[
          s.screenMotion,
          {
            opacity,
            transform: [{ translateY }, { scale }],
          },
        ]}
      >
        {React.createElement(Screen, props)}
      </Animated.View>
    );
  };
}

const HomeScreenAnimated = withScreenMotion(HomeScreen);
const SongsScreenAnimated = withScreenMotion(SongsScreen);
const UpdatesScreenAnimated = withScreenMotion(UpdatesScreen);
const TempleScreenAnimated = withScreenMotion(TempleScreen);
const ProfileScreenAnimated = withScreenMotion(ProfileScreen);
const DownloadsScreenAnimated = withScreenMotion(DownloadsScreen);
const WallpapersScreenAnimated = withScreenMotion(WallpapersScreen);
const ScripturesScreenAnimated = withScreenMotion(ScripturesScreen);
const HarivarasanamScreenAnimated = withScreenMotion(HarivarasanamScreen);
const LyricsScreenAnimated = withScreenMotion(LyricsScreen);
const DocumentReaderScreenAnimated = withScreenMotion(DocumentReaderScreen);
const AdminScreenAnimated = withScreenMotion(AdminScreen);
const AdminTempleEventScreenAnimated = withScreenMotion(AdminTempleEventScreen);
const AdminPadiPujaScreenAnimated = withScreenMotion(AdminPadiPujaScreen);
const AdminCalendarScreenAnimated = withScreenMotion(AdminCalendarScreen);

function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
        animation: "shift",
      }}
    >
  <Tabs.Screen name="Home" component={HomeScreenAnimated} />
  <Tabs.Screen name="Songs" component={SongsScreenAnimated} />
  <Tabs.Screen name="Updates" component={UpdatesScreenAnimated} />
  <Tabs.Screen name="Temple" component={TempleScreenAnimated} />
  <Tabs.Screen name="Profile" component={ProfileScreenAnimated} />
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
              animation: "fade_from_bottom",
            }}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Downloads" component={DownloadsScreenAnimated} />
            <Stack.Screen name="Wallpapers" component={WallpapersScreenAnimated} />
            <Stack.Screen name="Scriptures" component={ScripturesScreenAnimated} />
            <Stack.Screen
              name="Harivarasanam"
              component={HarivarasanamScreenAnimated}
            />
            <Stack.Screen name="Lyrics" component={LyricsScreenAnimated} />
            <Stack.Screen
              name="DocumentReader"
              component={DocumentReaderScreenAnimated}
            />
            <Stack.Screen
              name="Admin"
              component={AdminScreenAnimated}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="AdminTempleEvent"
              component={AdminTempleEventScreenAnimated}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="AdminPadiPuja"
              component={AdminPadiPujaScreenAnimated}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="AdminCalendar"
              component={AdminCalendarScreenAnimated}
              options={{ animation: "slide_from_right" }}
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
  screenMotion: { flex: 1 },
});
