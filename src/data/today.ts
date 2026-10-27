import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ImageSourcePropType } from "react-native";
import {
  saveTodaySchedule,
  saveWeeklySchedule,
  subscribeToTodaySchedule,
  subscribeToWeeklySchedule,
} from "../services/firebase";
import type { DeityKey, TodaySchedule, WeekdayKey, WeeklyDay, WeeklySchedule } from "../types";

/**
 * Deity options the admin can pick for the day.
 * Replace the image for each deity by dropping a file in assets/deities/
 * and pointing the `image` here to it.
 */
export const deities: { key: DeityKey; label: string; image: ImageSourcePropType }[] = [
  { key: "ayyappa", label: "Lord Ayyappa", image: require("../../assets/temple/ayyappa4.jpg") },
  { key: "ganapathi", label: "Lord Ganapathi", image: require("../../assets/temple/ayyappa7.jpg") },
  { key: "shiva", label: "Lord Shiva", image: require("../../assets/temple/ayyappa8.jpg") },
  { key: "vishnu", label: "Lord Vishnu", image: require("../../assets/temple/ayyappa-sanctum-original.jpg") },
  { key: "devi", label: "Devi", image: require("../../assets/temple/atlanta-ayyappa-welcome-floral.jpg") },
  { key: "murugan", label: "Lord Murugan", image: require("../../assets/temple/ayyappa-dark-sanctum-original.jpg") },
  { key: "hanuman", label: "Lord Hanuman", image: require("../../assets/temple/atlanta-ayyappa-home.jpg") },
];

export function deityImage(key: DeityKey) {
  return (deities.find((d) => d.key === key) ?? deities[0]!).image;
}

export function todayIso() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const defaultTodaySchedule: TodaySchedule = {
  date: "",
  openTime: "",
  closeTime: "",
  deity: "ayyappa",
  items: [],
};

/** Parses "6:00 AM" style times into minutes since midnight. */
export function parseTime(value: string): number | null {
  const match = /^\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*$/i.exec(value);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3]!.toUpperCase() === "PM") hours += 12;
  return hours * 60 + Number(match[2] ?? 0);
}

export function isOpenNow(schedule: TodaySchedule, now = new Date()) {
  const open = parseTime(schedule.openTime);
  const close = parseTime(schedule.closeTime);
  if (open === null || close === null) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= open && minutes < close;
}

const CACHE_KEY = "todaySchedule";

export function useTodaySchedule() {
  const [schedule, setSchedule] = useState<TodaySchedule>(defaultTodaySchedule);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(CACHE_KEY)
      .then((value) => {
        if (active && value) setSchedule(JSON.parse(value));
      })
      .catch(() => undefined);
    const stop = subscribeToTodaySchedule(
      (shared) => {
        if (!active || !shared) return;
        setSchedule(shared);
        void AsyncStorage.setItem(CACHE_KEY, JSON.stringify(shared));
      },
      () => undefined,
    );
    return () => {
      active = false;
      stop();
    };
  }, []);
  return schedule;
}

export async function publishTodaySchedule(schedule: TodaySchedule) {
  await saveTodaySchedule(schedule);
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(schedule));
}

// ---- Weekly schedule: one puja per weekday ----------------------------------

export const WEEKDAYS: { key: WeekdayKey; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

/** Pujas that repeat every week. The admin adds the timing and a picture for each. */
export const DEFAULT_WEEKLY: WeeklySchedule = {
  openTime: "",
  closeTime: "",
  days: {
    mon: { name: "Lord Shiva Puja", time: "" },
    tue: { name: "Lord Murugan Puja", time: "" },
    thu: { name: "Sai Baba Puja", time: "" },
    fri: { name: "Durga Devi Puja", time: "" },
    sat: { name: "Ayyappa Puja", time: "" },
  },
};

/** Picture shown until the admin uploads one for the day. */
const DAY_FALLBACK: Record<WeekdayKey, DeityKey> = {
  mon: "shiva",
  tue: "murugan",
  wed: "ayyappa",
  thu: "ayyappa",
  fri: "devi",
  sat: "ayyappa",
  sun: "ayyappa",
};

export function weekdayKey(date = new Date()): WeekdayKey {
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const)[date.getDay()]!;
}

/** Today's puja, or null on days with no puja (e.g. Wednesday and Sunday). */
export function pujaForDay(schedule: WeeklySchedule, key: WeekdayKey): WeeklyDay | null {
  const day = schedule.days[key];
  return day && day.name.trim() ? day : null;
}

export function dayFallbackImage(key: WeekdayKey) {
  return deityImage(DAY_FALLBACK[key] ?? "ayyappa");
}

const WEEKLY_KEY = "weeklySchedule";

export function useWeeklySchedule() {
  const [schedule, setSchedule] = useState<WeeklySchedule>(DEFAULT_WEEKLY);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(WEEKLY_KEY)
      .then((value) => {
        if (active && value) setSchedule(JSON.parse(value));
      })
      .catch(() => undefined);
    const stop = subscribeToWeeklySchedule(
      (shared) => {
        if (!active || !shared) return;
        setSchedule(shared);
        void AsyncStorage.setItem(WEEKLY_KEY, JSON.stringify(shared));
      },
      () => undefined,
    );
    return () => {
      active = false;
      stop();
    };
  }, []);
  return schedule;
}

export async function publishWeeklySchedule(schedule: WeeklySchedule) {
  await saveWeeklySchedule(schedule);
  await AsyncStorage.setItem(WEEKLY_KEY, JSON.stringify(schedule));
}

export function isOpenNowWeekly(schedule: WeeklySchedule, now = new Date()) {
  return isOpenNow({ ...defaultTodaySchedule, openTime: schedule.openTime, closeTime: schedule.closeTime }, now);
}
