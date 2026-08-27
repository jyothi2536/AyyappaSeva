import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { eventStart, localize } from "../data/events";
import type { CalendarEvent, Language } from "../types";

const CHANNEL_ID = "event-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function prepareNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Temple event reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 200, 250],
      lightColor: "#E9B949",
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleEventReminders(
  event: CalendarEvent,
  language: Language,
) {
  if (!event.remindersEnabled) return [];
  try {
    if (!(await prepareNotifications())) return [];
    const start = eventStart(event).getTime();
    const now = Date.now();
    const reminders = [
      { offset: 24 * 60 * 60 * 1000, label: "Tomorrow" },
      { offset: 60 * 60 * 1000, label: "In one hour" },
    ].filter(({ offset }) => start - offset > now);
    return await Promise.all(
      reminders.map(({ offset, label }) =>
        Notifications.scheduleNotificationAsync({
          content: {
            title: localize(event.title, language),
            body: `${label} · ${event.startTime} · ${event.venue}`,
            data: { eventId: event.id, kind: event.kind },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(start - offset),
            channelId: Platform.OS === "android" ? CHANNEL_ID : undefined,
          },
        }),
      ),
    );
  } catch {
    return [];
  }
}

export async function cancelEventReminders(notificationIds?: string[]) {
  await Promise.all(
    (notificationIds ?? []).map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
    ),
  );
}
