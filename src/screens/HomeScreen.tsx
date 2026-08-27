import React from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Icon } from "../components/UI";
import { homeTempleImage, wallpapers } from "../data/content";
import { useApp } from "../state/AppContext";
import type { RootStackParamList, TabParamList } from "../types";
import { colors } from "../theme";

export default function HomeScreen() {
  const { t } = useApp();
  const tab = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const root = tab.getParent<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={homeTempleImage}
        style={s.hero}
        imageStyle={s.heroImage}
      >
        <LinearGradient
          colors={["rgba(11,11,8,.02)", "rgba(11,11,8,.06)", colors.ink]}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.brandRow}>
          <View>
            <Text style={s.brandSmall}>AYYAPPA</Text>
            <Text style={s.brand}>SEVA</Text>
          </View>
          <View style={s.bell}>
            <Icon name="notifications-outline" color={colors.gold} />
          </View>
        </View>
        <View style={s.heroCopy}>
          <Text style={s.mantra}>{t.greeting}</Text>
          <Text style={s.heroSub}>{t.welcome}</Text>
          <Text style={s.ornament}>──── ◆ ────</Text>
        </View>
      </ImageBackground>
      <View style={s.page}>
        <Title text={t.today} />
        <LinearGradient colors={["#302716", "#1A1810"]} style={s.event}>
          <View style={s.eventIcon}>
            <Icon name="flame" color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.eventTitle}>{t.deeparadhana}</Text>
            <Text style={s.meta}>{t.evening} · 6:30 PM</Text>
          </View>
          <Text style={s.next}>{t.next}</Text>
        </LinearGradient>
        <Title text={t.quick} />
        <View style={s.quickRow}>
          <Pressable style={s.quick} onPress={() => tab.navigate("Songs")}>
            <Icon name="musical-notes" color={colors.gold} />
            <Text style={s.quickTitle}>{t.listen}</Text>
            <Text style={s.meta}>{t.collections}</Text>
          </Pressable>
          <Pressable style={s.quick} onPress={() => tab.navigate("Temple")}>
            <Icon name="location" color="#8DB48E" />
            <Text style={s.quickTitle}>{t.directions}</Text>
            <Text style={s.meta}>{t.openMap}</Text>
          </Pressable>
        </View>
        <Pressable
          style={s.wallpaper}
          onPress={() => root?.navigate("Wallpapers")}
        >
          <ImageBackground
            source={wallpapers[0].source}
            style={StyleSheet.absoluteFill}
            imageStyle={{ resizeMode: "cover" }}
          />
          <LinearGradient
            colors={["transparent", "rgba(11,11,8,.94)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.wallpaperCopy}>
            <Text style={s.wallpaperTitle}>{t.wallpaperTitle}</Text>
            <Text style={s.meta}>{t.wallpaperSub}</Text>
          </View>
        </Pressable>
        <Title
          text={t.latest}
          action={t.viewAll}
          onPress={() => tab.navigate("Updates")}
        />
      </View>
    </ScrollView>
  );
}
function Title({
  text,
  action,
  onPress,
}: {
  text: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.sectionTitle}>
      <Text style={s.sectionText}>{text}</Text>
      {action ? (
        <Pressable onPress={onPress}>
          <Text style={s.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  content: { paddingBottom: 30 },
  hero: {
    height: Math.min(Dimensions.get("window").height * 0.64, 560),
    justifyContent: "space-between",
  },
  heroImage: { resizeMode: "cover" },
  brandRow: {
    paddingTop: 46,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brandSmall: {
    color: colors.gold,
    fontSize: 9,
    letterSpacing: 5,
    fontWeight: "700",
  },
  brand: {
    color: colors.cream,
    fontSize: 19,
    letterSpacing: 7,
    fontWeight: "300",
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: { alignItems: "center", padding: 24 },
  mantra: {
    color: colors.cream,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowRadius: 12,
  },
  heroSub: { color: "#D2C9AD", marginTop: 8 },
  ornament: { color: colors.gold, marginTop: 17 },
  page: { paddingHorizontal: 20 },
  sectionTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 27,
    marginBottom: 13,
  },
  sectionText: { color: colors.cream, fontSize: 20, fontWeight: "900" },
  action: { color: colors.gold, fontSize: 11, fontWeight: "800" },
  event: {
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    gap: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  eventIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "rgba(233,185,73,.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  eventTitle: { color: colors.cream, fontSize: 15, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 11, marginTop: 5 },
  next: { color: colors.gold, fontSize: 10, fontWeight: "900" },
  quickRow: { flexDirection: "row", gap: 10 },
  quick: {
    flex: 1,
    minHeight: 130,
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: "flex-end",
  },
  quickTitle: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 18,
  },
  wallpaper: {
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 22,
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: colors.line,
  },
  wallpaperCopy: { padding: 17 },
  wallpaperTitle: { color: colors.cream, fontSize: 20, fontWeight: "900" },
});
