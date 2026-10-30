import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { TEMPLE_LOCATION, formatLocalTime, sunTimes } from "./sun";
import { getSunLocation } from "./location";

/** Length of the Mandala Deeksha. Irumudi is on the final day. */
export const DEEKSHA_DAYS = 41;
/** Day on which devotees are reminded to get ready for Irumudi. */
export const REMINDER_DAY = 40;
/** Local hour the Day-40 reminder is delivered. */
export const REMINDER_HOUR = 8;

const START_KEY = "deekshaStart";
const END_KEY = "deekshaEnd";
const REMINDER_KEY = "deekshaReminderId";
const CHANNEL_ID = "deeksha-reminders";
/** Notification payload route opened when the reminder is tapped. */
export const IRUMUDI_ROUTE = "Irumudi";

export type DeekshaProgress =
  | { status: "upcoming"; daysUntilStart: number }
  | { status: "active"; day: number; daysLeft: number; irumudiTomorrow: boolean; irumudiToday: boolean }
  | { status: "complete" };

/** "2026-10-24" → local midnight Date. */
export function parseDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toDay(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function daysBetween(from: Date, to: Date) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86_400_000);
}

/** Day 1 is the start (Maladharana) day; the last day (Day 41 by default) is Irumudi. */
export function deekshaProgress(
  startIso: string,
  now = new Date(),
  totalDays = DEEKSHA_DAYS,
): DeekshaProgress {
  const elapsed = daysBetween(parseDay(startIso), now);
  if (elapsed < 0) return { status: "upcoming", daysUntilStart: -elapsed };
  const day = elapsed + 1;
  if (day > totalDays) return { status: "complete" };
  return {
    status: "active",
    day,
    daysLeft: totalDays - day,
    irumudiTomorrow: day === totalDays - 1,
    irumudiToday: day === totalDays,
  };
}

/** Number of Deeksha days from start to end, both included. */
export function deekshaLength(startIso: string, endIso?: string | null) {
  if (!endIso) return DEEKSHA_DAYS;
  return Math.max(1, daysBetween(parseDay(startIso), parseDay(endIso)) + 1);
}

/** When the "Irumudi tomorrow" reminder fires (the day before the last day). */
export function reminderDate(startIso: string, totalDays = DEEKSHA_DAYS) {
  const date = parseDay(startIso);
  date.setDate(date.getDate() + totalDays - 2);
  date.setHours(REMINDER_HOUR, 0, 0, 0);
  return date;
}

export function irumudiDate(startIso: string, totalDays = DEEKSHA_DAYS) {
  const date = parseDay(startIso);
  date.setDate(date.getDate() + totalDays - 1);
  return date;
}

async function ensurePermission() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Deeksha reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 200, 250],
      lightColor: "#E9B949",
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

async function cancelReminder() {
  const id = await AsyncStorage.getItem(REMINDER_KEY);
  if (id) await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
  await AsyncStorage.removeItem(REMINDER_KEY);
}

/** Schedules the "Irumudi tomorrow" reminder. Returns false if it could not be set. */
async function scheduleReminder(startIso: string, totalDays = DEEKSHA_DAYS, name = "") {
  if (totalDays < 2) return false;
  const when = reminderDate(startIso, totalDays);
  if (when.getTime() <= Date.now()) return false;
  if (!(await ensurePermission())) return false;
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: name ? `${name} Swamy, get ready for Irumudi tomorrow 🙏` : "Get ready for Irumudi tomorrow 🙏",
      body: `Day ${totalDays - 1} of your Deeksha. Tap to see how to prepare your Irumudi. Swamiye Saranam Ayyappa.`,
      data: { route: IRUMUDI_ROUTE },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      channelId: Platform.OS === "android" ? CHANNEL_ID : undefined,
    },
  });
  await AsyncStorage.setItem(REMINDER_KEY, id);
  return true;
}

export async function loadDeekshaStart() {
  return AsyncStorage.getItem(START_KEY);
}

/** Chosen end (Irumudi) day, or null for the standard 41 days. */
export async function loadDeekshaEnd() {
  return AsyncStorage.getItem(END_KEY);
}

// ---- Daily sunrise / sunset puja reminders -------------------------------
// iOS keeps at most 64 pending local notifications, so only the next
// DAILY_WINDOW days are scheduled; the window is topped up whenever the app opens.
const DAILY_KEY = "deekshaDailyIds";
const DAILY_WINDOW = 14;
/** Minutes before sunrise / sunset the reminders are delivered. */
export const MORNING_LEAD_MIN = 60;
export const EVENING_LEAD_MIN = 60;

export type DailyReminder = { date: Date; title: string; body: string };

/** Morning + evening reminders for every remaining Deeksha day in the window. */
export function dailyReminders(
  startIso: string,
  now = new Date(),
  windowDays = DAILY_WINDOW,
  where: { latitude: number; longitude: number } = TEMPLE_LOCATION,
  totalDays = DEEKSHA_DAYS,
  name = "",
): DailyReminder[] {
  const out: DailyReminder[] = [];
  const hello = name ? `Swamiye Saranam Ayyappa, ${name} Swamy.` : "Swamiye Saranam Ayyappa.";
  const first = parseDay(startIso);
  for (let i = 0; i < totalDays; i++) {
    const day = new Date(first);
    day.setDate(first.getDate() + i);
    const ahead = (day.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86_400_000;
    if (ahead < 0) continue;
    if (ahead >= windowDays) break;
    const times = sunTimes(day.getFullYear(), day.getMonth() + 1, day.getDate(), where.latitude, where.longitude);
    if (!times) continue;
    const morning = new Date(times.sunrise.getTime() - MORNING_LEAD_MIN * 60_000);
    const evening = new Date(times.sunset.getTime() - EVENING_LEAD_MIN * 60_000);
    const label = `Deeksha Day ${i + 1} of ${totalDays}`;
    if (morning > now)
      out.push({
        date: morning,
        title: `🌅 ${label}`,
        body: `${hello} Today sunrise time is ${formatLocalTime(times.sunrise)}. Start your puja before sunrise.`,
      });
    if (evening > now)
      out.push({
        date: evening,
        title: `🪔 ${label}`,
        body: `${hello} Today sunset time is ${formatLocalTime(times.sunset)}. Please start offering your evening puja.`,
      });
  }
  return out;
}

async function cancelDaily() {
  const raw = await AsyncStorage.getItem(DAILY_KEY);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  await AsyncStorage.removeItem(DAILY_KEY);
  // Also remove any sunrise/sunset reminders that are still scheduled but no longer
  // tracked (left over from overlapping runs), so a reminder can never fire twice.
  const pending = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  await Promise.all(
    pending
      .filter((n) => /^(🌅|🪔) Deeksha Day /.test(n.content.title ?? ""))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => undefined)),
  );
}

let dailyQueue: Promise<void> = Promise.resolve();

/** (Re)schedules the upcoming sunrise / sunset reminders. Safe to call on every app open. */
export function syncDailyReminders() {
  // Run one at a time: overlapping calls used to each schedule a full set (duplicates).
  dailyQueue = dailyQueue.then(runSyncDailyReminders, runSyncDailyReminders);
  return dailyQueue;
}

async function runSyncDailyReminders() {
  const start = await AsyncStorage.getItem(START_KEY);
  await cancelDaily();
  if (!start) return;
  const total = deekshaLength(start, await AsyncStorage.getItem(END_KEY));
  const reminders = dailyReminders(start, new Date(), DAILY_WINDOW, await getSunLocation(), total, await loadDevoteeName());
  if (!reminders.length) return;
  try {
    if (!(await ensurePermission())) return;
    const ids: string[] = [];
    for (const r of reminders) {
      ids.push(
        await Notifications.scheduleNotificationAsync({
          content: { title: r.title, body: r.body, sound: true, data: { route: "Deeksha" } },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: r.date,
            channelId: Platform.OS === "android" ? CHANNEL_ID : undefined,
          },
        }),
      );
    }
    await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(ids));
  } catch {
    // Notifications unavailable; the countdown card still works.
  }
}

const REGISTRATION_KEY = "maladharanaRegistration";

export type DeekshaRegistration = {
  contact: { name: string; phone: string; email: string };
  devotees: { name: string; type: string; date: string }[];
  registeredAt: string;
};

/** Saves the Maladharana registration and starts the countdown from its Deeksha date. */
export async function saveMaladharanaRegistration(reg: DeekshaRegistration, startIso: string) {
  await AsyncStorage.setItem(REGISTRATION_KEY, JSON.stringify(reg));
  return saveDeekshaStart(startIso);
}

export async function loadMaladharanaRegistration(): Promise<DeekshaRegistration | null> {
  const raw = await AsyncStorage.getItem(REGISTRATION_KEY);
  try {
    return raw ? (JSON.parse(raw) as DeekshaRegistration) : null;
  } catch {
    return null;
  }
}

/** Devotee name from the Deeksha registration, or "" if none was given. */
export async function loadDevoteeName() {
  const reg = await loadMaladharanaRegistration();
  return (reg?.devotees[0]?.name || reg?.contact.name || "").trim();
}

/** Changes the devotee name and re-schedules reminders so they use it. */
export async function updateDevoteeName(name: string) {
  const reg = await loadMaladharanaRegistration();
  const start = await AsyncStorage.getItem(START_KEY);
  if (!reg || !start) return;
  const clean = name.trim();
  reg.contact.name = clean;
  if (reg.devotees[0]) reg.devotees[0].name = clean;
  else reg.devotees.push({ name: clean, type: "Self", date: start });
  await AsyncStorage.setItem(REGISTRATION_KEY, JSON.stringify(reg));
  await saveDeekshaStart(start, await AsyncStorage.getItem(END_KEY));
  notifyDeekshaChange();
}

/** Saves the start (and optional end) day on this phone and (re)schedules the reminders. */
export async function saveDeekshaStart(startIso: string, endIso?: string | null) {
  await AsyncStorage.setItem(START_KEY, startIso);
  if (endIso) await AsyncStorage.setItem(END_KEY, endIso);
  else await AsyncStorage.removeItem(END_KEY);
  await cancelReminder();
  try {
    const ok = await scheduleReminder(startIso, deekshaLength(startIso, endIso), await loadDevoteeName());
    await syncDailyReminders();
    return ok;
  } catch {
    return false;
  }
}

export async function clearDeekshaStart() {
  await AsyncStorage.multiRemove([START_KEY, END_KEY, REGISTRATION_KEY]);
  await cancelDaily();
  await cancelReminder();
}

// ---- Testing helpers (hamburger menu "Start Deeksha") --------------------

type Listener = () => void;
const listeners = new Set<Listener>();
/** Lets the countdown card update right away when Deeksha starts or ends. */
export function onDeekshaChange(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export const notifyDeekshaChange = () => listeners.forEach((l) => l());

/** Starts a Deeksha from the menu with the dates the devotee picked. */
export async function startDeekshaWithDates(startIso: string, endIso: string, name = "") {
  const clean = name.trim();
  const reg: DeekshaRegistration = {
    contact: { name: clean, phone: "", email: "" },
    devotees: [{ name: clean, type: "Self", date: startIso }],
    registeredAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(REGISTRATION_KEY, JSON.stringify(reg));
  return saveDeekshaStart(startIso, endIso);
}

/** Starts a Deeksha without the registration form. `daysAgo` = 0 makes today Day 1. */
export async function startTestDeeksha(daysAgo = 0) {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo);
  const startIso = toDay(start);
  const reg: DeekshaRegistration = {
    contact: { name: "Test Devotee", phone: "", email: "" },
    devotees: [{ name: "Test Devotee", type: "Test", date: startIso }],
    registeredAt: new Date().toISOString(),
  };
  return saveMaladharanaRegistration(reg, startIso);
}

/** Fires the morning, evening and Irumudi reminders a few seconds apart so they can be seen now. */
export async function sendTestReminders() {
  if (!(await ensurePermission())) return false;
  const samples = [
    {
      title: `🌅 Deeksha Day 1 of ${DEEKSHA_DAYS}`,
      body: "Swamiye Saranam Ayyappa. Today sunrise time is 7:45 AM. Start your puja before sunrise.",
      data: { route: "Deeksha" },
    },
    {
      title: `🪔 Deeksha Day 1 of ${DEEKSHA_DAYS}`,
      body: "Swamiye Saranam Ayyappa. Today sunset time is 6:50 PM. Please start offering your evening puja.",
      data: { route: "Deeksha" },
    },
    {
      title: "Get ready for Irumudi tomorrow 🙏",
      body: "Day 40 of your Deeksha. Tap to see how to prepare your Irumudi. Swamiye Saranam Ayyappa.",
      data: { route: IRUMUDI_ROUTE },
    },
  ];
  for (const [i, sample] of samples.entries()) {
    await Notifications.scheduleNotificationAsync({
      content: { ...sample, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10 + i * 10,
        channelId: Platform.OS === "android" ? CHANNEL_ID : undefined,
      },
    });
  }
  return true;
}

/** Number of Deeksha reminders currently waiting on this phone. */
export async function pendingReminderCount() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.length;
}
