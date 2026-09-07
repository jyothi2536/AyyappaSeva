import React, { useState } from "react";
import {
  Image,
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
import { getHomeTempleFraming } from "../components/homeTempleFraming";
import { homeTempleImage, wallpapers } from "../data/content";
import { useApp } from "../state/AppContext";
import type { RootStackParamList, TabParamList } from "../types";
import { colors } from "../theme";

export default function HomeScreen() {
  const { t } = useApp();
  const [photoWidth, setPhotoWidth] = useState(0);
  const framing = getHomeTempleFraming(photoWidth);
  const tab = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const root = tab.getParent<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.heroSpace}>
        <LinearGradient
          colors={["#987740", "#42331B", "#786035"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroFrame}
        >
          <View style={s.heroInner}>
            <View
              onLayout={({ nativeEvent }) => setPhotoWidth(nativeEvent.layout.width)}
              style={[s.heroPhoto, { height: framing.viewportHeight }]}
            >
              {photoWidth > 0 && (
                <Image
                  source={homeTempleImage}
                  accessibilityLabel="Lord Ayyappa at Atlanta Ayyappa Temple"
                  resizeMode="contain"
                  style={[s.heroImage, framing.image]}
                />
              )}
              <LinearGradient
                pointerEvents="none"
                colors={["rgba(15,12,6,.42)", "transparent", "transparent", "rgba(15,12,6,.42)"]}
                locations={[0, 0.24, 0.76, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                pointerEvents="none"
                colors={["rgba(15,12,6,.10)", "transparent", "rgba(25,21,12,.65)"]}
                locations={[0, 0.7, 1]}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <LinearGradient colors={["#19150C", "#11110C"]} style={s.heroCopy}>
              <View accessible={false} style={s.ornament}>
                <View style={s.ornamentLine} />
                <View style={s.ornamentDiamond} />
                <View style={s.ornamentLine} />
              </View>
              <Text style={s.mantra}>{t.greeting}</Text>
              <Text style={s.heroSub}>{t.welcome}</Text>
            </LinearGradient>
          </View>
        </LinearGradient>
      </View>
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
  heroSpace: { paddingHorizontal: 20, paddingTop: 18 },
  heroFrame: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    borderRadius: 28,
    padding: 1,
  },
  heroInner: {
    backgroundColor: "#19150C",
    borderRadius: 27,
    overflow: "hidden",
  },
  heroPhoto: { width: "100%", overflow: "hidden" },
  heroImage: { position: "absolute" },
  heroCopy: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },
  mantra: {
    color: colors.cream,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  heroSub: {
    color: "#C4B99C",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    textAlign: "center",
  },
  ornament: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  ornamentLine: { width: 35, height: 1, backgroundColor: "#806330" },
  ornamentDiamond: { width: 5, height: 5, backgroundColor: colors.gold, transform: [{ rotate: "45deg" }] },
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
