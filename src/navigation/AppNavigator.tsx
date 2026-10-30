import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, StyleSheet, View } from "react-native";
import {
  createNavigationContainerRef,
  DefaultTheme,
  NavigationContainer,
  StackActions,
  useIsFocused,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  AppFooter,
  AppHeader,
  type AppTab,
  type MenuTarget,
} from "../components/AppChrome";
import type { RootStackParamList, TabParamList } from "../types";
import { colors } from "../theme";
import * as Notifications from "expo-notifications";
import {
  IRUMUDI_ROUTE,
  clearDeekshaStart,
  loadDeekshaStart,
  notifyDeekshaChange,
  startDeekshaWithDates,
} from "../services/deeksha";
import StartDeekshaSheet from "../components/StartDeekshaSheet";
import HomeScreen from "../screens/HomeScreen";
import SongsScreen from "../screens/SongsScreen";
import UpdatesScreen from "../screens/UpdatesScreen";
import PoojaScreen from "../screens/PoojaScreen";
import TempleScreen from "../screens/TempleScreen";
import DeekshaScreen from "../screens/DeekshaScreen";
import ProfileScreen from "../screens/ProfileScreen";
import WallpapersScreen from "../screens/WallpapersScreen";
import MaladharanaScreen from "../screens/MaladharanaScreen";
import MaladharanaReviewScreen from "../screens/MaladharanaReviewScreen";
import ScripturesScreen from "../screens/ScripturesScreen";
import HarivarasanamScreen from "../screens/HarivarasanamScreen";
import LyricsScreen from "../screens/LyricsScreen";
import DocumentReaderScreen from "../screens/DocumentReaderScreen";
import AdminScreen from "../screens/AdminScreen";
import AdminTempleEventScreen from "../screens/AdminTempleEventScreen";
import AdminPadiPujaScreen from "../screens/AdminPadiPujaScreen";
import AdminCalendarScreen from "../screens/AdminCalendarScreen";
import AdminTodayScreen from "../screens/AdminWeeklyScreen";
import AdminUpdatesScreen from "../screens/AdminUpdatesScreen";
import AdminWallpapersScreen from "../screens/AdminWallpapersScreen";
import DevoteeLoginScreen from "../screens/DevoteeLoginScreen";
import DevoteeSignUpScreen from "../screens/DevoteeSignUpScreen";
import BookPoojaScreen from "../screens/BookPoojaScreen";
import ContactTempleScreen from "../screens/ContactTempleScreen";
import IrumudiScreen from "../screens/IrumudiScreen";
import VideoPlayerScreen from "../screens/VideoPlayerScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import IrumudiRegistrationScreen from "../screens/IrumudiRegistrationScreen";
import HomePadiPujaScreen from "../screens/HomePadiPujaScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();
const tabNames: AppTab[] = ["Home", "Temple", "Events", "Updates", "Deeksha", "Songs", "Profile"];

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
const PoojaScreenAnimated = withScreenMotion(PoojaScreen);
const TempleScreenAnimated = withScreenMotion(TempleScreen);
const DeekshaScreenAnimated = withScreenMotion(DeekshaScreen);
const ProfileScreenAnimated = withScreenMotion(ProfileScreen);
const WallpapersScreenAnimated = withScreenMotion(WallpapersScreen);
const MaladharanaScreenAnimated = withScreenMotion(MaladharanaScreen);
const MaladharanaReviewScreenAnimated = withScreenMotion(MaladharanaReviewScreen);
const ScripturesScreenAnimated = withScreenMotion(ScripturesScreen);
const HarivarasanamScreenAnimated = withScreenMotion(HarivarasanamScreen);
const LyricsScreenAnimated = withScreenMotion(LyricsScreen);
const DocumentReaderScreenAnimated = withScreenMotion(DocumentReaderScreen);
const AdminScreenAnimated = withScreenMotion(AdminScreen);
const AdminTempleEventScreenAnimated = withScreenMotion(AdminTempleEventScreen);
const AdminPadiPujaScreenAnimated = withScreenMotion(AdminPadiPujaScreen);
const AdminCalendarScreenAnimated = withScreenMotion(AdminCalendarScreen);
const AdminTodayScreenAnimated = withScreenMotion(AdminTodayScreen);
const AdminUpdatesScreenAnimated = withScreenMotion(AdminUpdatesScreen);
const AdminWallpapersScreenAnimated = withScreenMotion(AdminWallpapersScreen);
const DevoteeLoginScreenAnimated = withScreenMotion(DevoteeLoginScreen);
const DevoteeSignUpScreenAnimated = withScreenMotion(DevoteeSignUpScreen);
const BookPoojaScreenAnimated = withScreenMotion(BookPoojaScreen);
const ContactTempleScreenAnimated = withScreenMotion(ContactTempleScreen);
const IrumudiScreenAnimated = withScreenMotion(IrumudiScreen);
const VideoPlayerScreenAnimated = withScreenMotion(VideoPlayerScreen);
const EventDetailScreenAnimated = withScreenMotion(EventDetailScreen);
const IrumudiRegistrationScreenAnimated = withScreenMotion(IrumudiRegistrationScreen);
const HomePadiPujaScreenAnimated = withScreenMotion(HomePadiPujaScreen);

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
  <Tabs.Screen name="Temple" component={TempleScreenAnimated} />
  <Tabs.Screen name="Events" component={UpdatesScreenAnimated} />
  <Tabs.Screen name="Updates" component={PoojaScreenAnimated} />
  <Tabs.Screen name="Deeksha" component={DeekshaScreenAnimated} />
  <Tabs.Screen name="Songs" component={SongsScreenAnimated} />
  <Tabs.Screen name="Profile" component={ProfileScreenAnimated} />
    </Tabs.Navigator>
  );
}
export default function AppNavigator() {
  const [activeTab, setActiveTab] = useState<AppTab>("Home");
  const [canGoBack, setCanGoBack] = useState(false);
  const [deekshaActive, setDeekshaActive] = useState(false);
  const [pickingDates, setPickingDates] = useState(false);
  const syncActiveTab = useCallback(() => {
    setCanGoBack(navigationRef.isReady() && navigationRef.canGoBack());
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
  // Tapping the Day-40 "Irumudi tomorrow" reminder opens the Irumudi page,
  // whether the app was running or launched from the notification.
  const pendingRoute = useRef<string | null>(null);
  const openNotificationRoute = useCallback((route: unknown) => {
    if (route === "Deeksha") {
      if (navigationRef.isReady()) navigateToTab("Deeksha");
      return;
    }
    if (route !== IRUMUDI_ROUTE) return;
    if (navigationRef.isReady()) navigationRef.navigate("Irumudi");
    else pendingRoute.current = IRUMUDI_ROUTE;
  }, [navigateToTab]);
  useEffect(() => {
    const handled = new Set<string>();
    const handle = (r: Notifications.NotificationResponse | null) => {
      if (!r) return;
      const id = r.notification.request.identifier;
      if (handled.has(id)) return;
      handled.add(id);
      openNotificationRoute(r.notification.request.content.data?.route);
    };
    void Notifications.getLastNotificationResponseAsync().then(handle).catch(() => undefined);
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    return () => sub.remove();
  }, [openNotificationRoute]);
  const onNavReady = useCallback(() => {
    syncActiveTab();
    if (pendingRoute.current) {
      pendingRoute.current = null;
      navigationRef.navigate("Irumudi");
    }
  }, [syncActiveTab]);
  const navigateFromMenu = useCallback(
    (target: MenuTarget) => {
      if ("tab" in target) {
        navigateToTab(target.tab);
      } else if (target.route === "BookPooja") {
        Alert.alert("Book a Pooja", "Online pooja booking is coming soon.");
      } else if (target.route === "StartDeeksha") {
        void (async () => {
          if (await loadDeekshaStart()) {
            await clearDeekshaStart();
            setDeekshaActive(false);
            notifyDeekshaChange();
            navigateToTab("Home");
          } else {
            setPickingDates(true);
          }
        })();
      } else if (navigationRef.isReady()) {
        navigationRef.navigate(target.route);
      }
    },
    [navigateToTab],
  );
  return (
    <View style={s.shell}>
      <AppHeader
        onUpdates={() => navigateToTab("Events")}
        onMenuNavigate={navigateFromMenu}
        deekshaActive={deekshaActive}
        onMenuOpen={() => void loadDeekshaStart().then((v) => setDeekshaActive(Boolean(v)))}
        onBack={
          canGoBack
            ? () => {
                if (navigationRef.isReady() && navigationRef.canGoBack()) navigationRef.goBack();
              }
            : undefined
        }
      />
      <View style={s.content}>
        <NavigationContainer
          ref={navigationRef}
          onReady={onNavReady}
          onStateChange={syncActiveTab}
          theme={{
            ...DefaultTheme,
            colors: {
              ...DefaultTheme.colors,
              background: colors.background,
              card: colors.surface,
              text: colors.text,
              border: colors.line,
              primary: colors.gold,
            },
          }}
        >
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              presentation: "card",
              contentStyle: { backgroundColor: colors.background },
              animation: "fade_from_bottom",
            }}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Wallpapers" component={WallpapersScreenAnimated} />
            <Stack.Screen name="Scriptures" component={ScripturesScreenAnimated} />
            <Stack.Screen
              name="Harivarasanam"
              component={HarivarasanamScreenAnimated}
            />
            <Stack.Screen name="Lyrics" component={LyricsScreenAnimated} />
            <Stack.Screen name="VideoPlayer" component={VideoPlayerScreenAnimated} />
            <Stack.Screen name="EventDetail" component={EventDetailScreenAnimated} />
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
            <Stack.Screen
              name="AdminToday"
              component={AdminTodayScreenAnimated}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="AdminUpdates"
              component={AdminUpdatesScreenAnimated}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="AdminWallpapers"
              component={AdminWallpapersScreenAnimated}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen name="DevoteeLogin" component={DevoteeLoginScreenAnimated} options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="DevoteeSignUp" component={DevoteeSignUpScreenAnimated} options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="BookPooja" component={BookPoojaScreenAnimated} options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="ContactTemple" component={ContactTempleScreenAnimated} options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="Irumudi" component={IrumudiScreenAnimated} options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="IrumudiRegistration" component={IrumudiRegistrationScreenAnimated} options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="HomePadiPuja" component={HomePadiPujaScreenAnimated} options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="Maladharana" component={MaladharanaScreenAnimated} options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="MaladharanaReview" component={MaladharanaReviewScreenAnimated} options={{ animation: "slide_from_right" }} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
      <AppFooter activeTab={activeTab} onNavigate={navigateToTab} />
      <StartDeekshaSheet
        visible={pickingDates}
        onClose={() => setPickingDates(false)}
        onStart={async (startIso, endIso, name) => {
          setPickingDates(false);
          await startDeekshaWithDates(startIso, endIso, name);
          setDeekshaActive(true);
          notifyDeekshaChange();
          navigateToTab("Home");
        }}
      />
    </View>
  );
}
const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  screenMotion: { flex: 1 },
});
