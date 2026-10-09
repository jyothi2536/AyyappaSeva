import React, { useState } from "react";
import {
  Alert,
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
import { useDevotee } from "../services/devotee";
import { deityImage, isOpenNow, useTodaySchedule } from "../data/today";
import { useApp } from "../state/AppContext";
import type { RootStackParamList, TabParamList } from "../types";
import { colors } from "../theme";

export default function HomeScreen() {
  const { t } = useApp();
  const today = useTodaySchedule();
  const devotee = useDevotee();
  const open = isOpenNow(today);
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
      <View style={s.banner}>
        <ImageBackground
          source={homeTempleImage}
          accessibilityLabel="Lord Ayyappa at Atlanta Ayyappa Temple"
          resizeMode="cover"
          style={s.bannerImage}
        >
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(12,8,3,.88)", "rgba(12,8,3,.15)", "rgba(12,8,3,.15)", "rgba(12,8,3,.88)"]}
            locations={[0, 0.34, 0.66, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.bannerLeft}>
            <Text style={s.bannerScript}>Swamiye{"\n"}Saranam{"\n"}Ayyappa</Text>
            <View style={s.bannerOrnament}>
              <View style={s.bannerLine} />
              <View style={s.ornamentDiamond} />
              <View style={s.bannerLine} />
            </View>
            <Text style={s.bannerSmall}>DHARMO RAKSHATHI{"\n"}RAKSHITHAHA</Text>
          </View>
          <View style={s.bannerRight}>
            <Text style={s.bannerSmall}>DEVOTION{"\n"}DISCIPLINE{"\n"}UNITY{"\n"}SERVICE</Text>
            <View style={s.bannerDivider} />
            <Text style={s.bannerSmall}>A STRONGER{"\n"}COMMUNITY{"\n"}IN HIS GRACE</Text>
          </View>
        </ImageBackground>
      </View>
      <View style={s.page}>
        <View style={s.today}>
          <View style={s.todayHead}>
            <Icon name="business" size={22} color={colors.gold} />
            <Text style={s.todayTitle}>Today at the Temple</Text>
          </View>
          {today.openTime && today.closeTime ? (
          <View style={s.todayStatus}>
            <View style={[s.openPill, !open && s.closedPill]}>
              <View style={s.openDot} />
              <Text style={s.openText}>{open ? "Open Now" : "Closed"}</Text>
            </View>
            <Text style={s.hours}>
              Open {today.openTime} – {today.closeTime}
            </Text>
          </View>
          ) : null}
          {today.items.length === 0 ? (
            <View style={s.todayEmpty}>
              <Icon name="calendar-clear-outline" size={22} color={colors.muted} />
              <Text style={s.todayEmptyText}>No events today</Text>
            </View>
          ) : (
          <View style={s.todayBody}>
            <Icon name="time-outline" size={24} color={colors.gold} />
            <View style={s.todayList}>
              {today.items.map((item, index) => (
                <View key={`${item.time}-${index}`} style={s.todayRow}>
                  <Text style={s.todayTime}>{item.time}</Text>
                  <Text style={s.todayName} numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
            <View style={s.todayDivider} />
            <Image
              source={deityImage(today.deity)}
              accessibilityLabel={`Deity of the day: ${today.deity}`}
              resizeMode="cover"
              style={s.todayImage}
            />
          </View>
          )}
        </View>
        <Title
          text="Quick Actions"
        />
        <View style={s.quickRow}>
          <Pressable
            accessibilityRole="button"
            style={[s.quick, s.quickGold]}
            onPress={() =>
              devotee
                ? root?.navigate("BookPooja")
                : root?.navigate("DevoteeLogin", { next: "BookPooja" })
            }
          >
            <Icon name="create-outline" color={colors.saffron} size={30} />
            <Text style={s.quickTitle}>Book a Pooja</Text>
            <Text style={s.quickSub}>Seva & Offerings</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[s.quick, s.quickPink]}
            onPress={() => Alert.alert("Donate", "Online donations are coming soon.")}
          >
            <Icon name="heart" color={colors.red} size={30} />
            <Text style={s.quickTitle}>Donate</Text>
            <Text style={s.quickSub}>Support Our Temple</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[s.quick, s.quickGreen]}
            onPress={() => root?.navigate("ContactTemple")}
          >
            <Icon name="call" color={colors.success} size={30} />
            <Text style={s.quickTitle}>Contact Temple</Text>
            <Text style={s.quickSub}>Get in Touch</Text>
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
            <Text style={s.wallpaperSub}>{t.wallpaperSub}</Text>
          </View>
        </Pressable>
        <Title
          text={t.latest}
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
  today: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginTop: 4,
    marginBottom: 6,
    shadowColor: "#6B4A12",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  todayHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  todayTitle: { color: colors.text, fontFamily: "serif", fontSize: 19, fontWeight: "700" },
  todayStatus: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  openPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.success,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  closedPill: { backgroundColor: colors.red },
  openDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" },
  openText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  hours: { color: colors.text, fontSize: 12, fontWeight: "600" },
  todayBody: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  todayList: { flex: 1, gap: 8 },
  todayRow: { flexDirection: "row", gap: 10 },
  todayTime: { color: colors.text, fontSize: 12, fontWeight: "600", width: 58 },
  todayName: { color: colors.text, fontSize: 12, flex: 1 },
  todayDivider: { width: 1, alignSelf: "stretch", backgroundColor: colors.line },
  todayImage: { width: 110, height: 120, borderRadius: 12 },
  todayEmpty: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 18, justifyContent: "center" },
  todayEmptyText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  banner: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#1A1107",
    shadowColor: "#6B4A12",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  bannerImage: {
    height: 240,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  bannerLeft: { width: "40%" },
  bannerRight: { width: "32%", alignItems: "flex-start" },
  bannerScript: {
    color: colors.goldFill,
    fontFamily: "serif",
    fontStyle: "italic",
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "600",
  },
  bannerOrnament: { flexDirection: "row", alignItems: "center", gap: 6, marginVertical: 10 },
  bannerLine: { width: 26, height: 1, backgroundColor: colors.goldFill },
  bannerSmall: {
    color: colors.cream,
    fontSize: 9,
    lineHeight: 15,
    letterSpacing: 1.4,
    fontWeight: "600",
  },
  bannerDivider: { width: 34, height: 1, backgroundColor: colors.goldFill, marginVertical: 10 },
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 30 },
  heroSpace: { paddingHorizontal: 20, paddingTop: 18 },
  heroFrame: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    borderRadius: 26,
    shadowColor: "#6B4A12",
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  heroInner: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  heroPhoto: { width: "100%", overflow: "hidden" },
  heroImage: { position: "absolute" },
  heroCopy: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: colors.surface,
  },
  mantra: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    fontFamily: "serif",
    textAlign: "center",
  },
  heroSub: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    textAlign: "center",
  },
  ornament: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  ornamentLine: { width: 35, height: 1, backgroundColor: "rgba(168,118,26,.5)" },
  ornamentDiamond: { width: 5, height: 5, backgroundColor: colors.goldFill, transform: [{ rotate: "45deg" }] },
  page: { paddingHorizontal: 20 },
  sectionTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 27,
    marginBottom: 13,
  },
  sectionText: { color: colors.text, fontSize: 20, fontWeight: "700", fontFamily: "serif" },
  action: { color: colors.text, fontSize: 12, fontWeight: "700" },
  event: {
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    gap: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  eventIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#FFF1DA",
    alignItems: "center",
    justifyContent: "center",
  },
  eventTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 11, marginTop: 5 },
  next: { color: colors.saffron, fontSize: 10, fontWeight: "900" },
  quickRow: { flexDirection: "row", gap: 8 },
  quick: {
    flex: 1,
    minHeight: 118,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  quickGold: { backgroundColor: "#FFF3D9" },
  quickPink: { backgroundColor: "#FCE4E6" },
  quickGreen: { backgroundColor: colors.greenSoft },
  quickTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "serif",
    marginTop: 10,
    textAlign: "center",
  },
  quickSub: { color: colors.muted, fontSize: 10, marginTop: 3, textAlign: "center" },
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
  wallpaperSub: { color: "rgba(255,246,227,.8)", fontSize: 11, marginTop: 5 },
});
