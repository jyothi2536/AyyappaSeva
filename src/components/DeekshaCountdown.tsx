import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, AppState, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { colors } from "../theme";
import { Icon } from "./UI";
import {
  DEEKSHA_DAYS,
  clearDeekshaStart,
  deekshaLength,
  deekshaProgress,
  irumudiDate,
  loadDeekshaEnd,
  loadDeekshaStart,
  loadMaladharanaRegistration,
  notifyDeekshaChange,
  onDeekshaChange,
  startDeekshaWithDates,
  syncDailyReminders,
  toDay,
  type DeekshaProgress,
} from "../services/deeksha";
import StartDeekshaSheet from "./StartDeekshaSheet";
import { IS_WEBSITE } from "../platform";

const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

/** 41-day Mandala Deeksha countdown (phone app only; hidden on the website). */
export default function DeekshaCountdown() {
  return IS_WEBSITE ? null : <PhoneDeekshaCountdown />;
}

/** Recomputes on focus and when the app returns to the foreground. */
function PhoneDeekshaCountdown() {
  const navigation = useNavigation<any>();
  const [start, setStart] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [today, setToday] = useState(() => toDay(new Date()));
  const [name, setName] = useState("");
  const [total, setTotal] = useState(DEEKSHA_DAYS);
  const [editing, setEditing] = useState(false);

  const refresh = useCallback(() => {
    setToday(toDay(new Date()));
    Promise.all([loadMaladharanaRegistration(), loadDeekshaStart(), loadDeekshaEnd()]).then(([reg, v, end]) => {
      setStart(reg ? v : null);
      setTotal(v ? deekshaLength(v, end) : DEEKSHA_DAYS);
      setName(reg?.devotees[0]?.name ?? "");
      setLoaded(true);
      if (reg && v) void syncDailyReminders();
    });
  }, []);
  useFocusEffect(refresh);
  useEffect(() => onDeekshaChange(refresh), [refresh]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (st) => st === "active" && refresh());
    return () => sub.remove();
  }, [refresh]);

  const reset = () =>
    Alert.alert("End Deeksha?", "Your countdown and Day 40 reminder will be removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: async () => {
          await clearDeekshaStart();
          setStart(null);
        },
      },
    ]);

  if (!loaded) return null;

  // Only shown once the devotee has registered for Maladharana.
  if (!start) return null;

  const endIso = toDay(irumudiDate(start, total));
  return (
    <>
      <ActiveCountdown
        name={name}
        total={total}
        progress={deekshaProgress(start, new Date(`${today}T12:00:00`), total)}
        irumudi={irumudiDate(start, total)}
        onIrumudi={() => navigation.navigate("Irumudi")}
        onReset={reset}
        onEdit={() => setEditing(true)}
      />
      <StartDeekshaSheet
        visible={editing}
        initial={{ name, start, end: endIso }}
        onClose={() => setEditing(false)}
        onStart={async (s2, e2, n2) => {
          setEditing(false);
          await startDeekshaWithDates(s2, e2, n2);
          notifyDeekshaChange();
        }}
      />
    </>
  );
}

function ActiveCountdown({
  name,
  total,
  progress,
  irumudi,
  onIrumudi,
  onReset,
  onEdit,
}: {
  name: string;
  total: number;
  progress: DeekshaProgress;
  irumudi: Date;
  onIrumudi: () => void;
  onReset: () => void;
  onEdit: () => void;
}) {
  const day = progress.status === "active" ? progress.day : progress.status === "complete" ? total : 0;
  const anim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    anim.setValue(0);
    const id = anim.addListener(({ value }) => setShown(Math.round(value)));
    Animated.timing(anim, {
      toValue: day,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() =>
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 180, useNativeDriver: true }),
        Animated.spring(pulse, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start(),
    );
    return () => anim.removeListener(id);
  }, [anim, pulse, day]);

  const width = anim.interpolate({ inputRange: [0, total], outputRange: ["0%", "100%"] });

  let headline: string;
  let note: string;
  if (progress.status === "upcoming") {
    headline = `Starts in ${progress.daysUntilStart} day${progress.daysUntilStart === 1 ? "" : "s"}`;
    note = `Irumudi on ${fmt(irumudi)}`;
  } else if (progress.status === "complete") {
    headline = "Deeksha complete";
    note = "Swamiye Saranam Ayyappa 🙏";
  } else if (progress.irumudiToday) {
    headline = "Irumudi day!";
    note = "Swamiye Saranam Ayyappa 🙏";
  } else if (progress.irumudiTomorrow) {
    headline = "Get ready for Irumudi tomorrow";
    note = fmt(irumudi);
  } else {
    headline = `${progress.daysLeft} days to Irumudi`;
    note = `Irumudi on ${fmt(irumudi)}`;
  }
  const highlight = progress.status === "active" && (progress.irumudiTomorrow || progress.irumudiToday);

  return (
    <View style={[s.card, highlight && s.cardHot]}>
      <View style={s.row}>
        <Animated.View style={[s.dayCircle, { transform: [{ scale: pulse }] }]}>
          <Text style={s.dayLabel}>DAY</Text>
          <Text style={s.dayNum}>{shown}</Text>
          <Text style={s.dayOf}>of {total}</Text>
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>{name ? `SWAMI ${name.toUpperCase()}'S DEEKSHA` : "MANDALA DEEKSHA"}</Text>
          <Text style={s.title}>{headline}</Text>
          <Text style={s.sub}>{note}</Text>
        </View>
      </View>
      <View style={s.track}>
        <Animated.View style={[s.fill, { width }]} />
      </View>
      <View style={s.actions}>
        <Pressable style={[s.primary, s.btn]} onPress={onEdit} accessibilityLabel="Edit Deeksha">
          <Icon name="create-outline" color={colors.ink} size={16} />
          <Text style={s.primaryText}>EDIT</Text>
        </Pressable>
        <Pressable style={[s.secondary, s.btn]} onPress={onReset}>
          <Text style={s.secondaryText}>{progress.status === "complete" ? "Clear" : "End"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 14,
    marginBottom: 16,
  },
  cardHot: { borderColor: colors.saffron, borderWidth: 1.5, backgroundColor: colors.maroonSoft },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.maroonSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#7A1426",
    borderWidth: 3,
    borderColor: colors.goldFill,
    alignItems: "center",
    justifyContent: "center",
  },
  dayLabel: { color: colors.goldFill, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  dayNum: { color: colors.cream, fontSize: 30, fontWeight: "900", lineHeight: 34 },
  dayOf: { color: colors.cream, fontSize: 10, opacity: 0.85 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: colors.maroon, fontSize: 18, fontWeight: "800", marginTop: 2 },
  sub: { color: colors.muted, fontSize: 13, marginTop: 3, lineHeight: 18 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.raised, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.saffron },
  actions: { flexDirection: "row", gap: 10, alignItems: "center" },
  primary: {
    backgroundColor: colors.goldFill,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  primaryText: { color: colors.ink, fontWeight: "800", letterSpacing: 0.8, fontSize: 13 },
  secondary: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryText: { color: colors.maroon, fontWeight: "700", fontSize: 13 },
  btn: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  picker: { gap: 10 },
});
