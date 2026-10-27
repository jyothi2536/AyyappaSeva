import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { doc, getDocs, collection, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const PROJECT_ID = "89f6a298-05f8-423b-a4e9-aaa2471fed08";

/** Registers this device so the admin's GO LIVE can notify it. Silent on any failure. */
export async function registerForLivePush() {
  try {
    if (!db) return;
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("live", {
        name: "Live darshan",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return;
    const projectId = PROJECT_ID;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await setDoc(doc(db, "pushTokens", token.replace(/[^A-Za-z0-9]/g, "_")), {
      token,
      platform: Platform.OS,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Push is optional (e.g. simulator, no network, permission denied).
  }
}

/** Admin only: notify every registered device that the live darshan has started. */
export async function sendLiveNotification(title: string) {
  if (!db) return 0;
  const snap = await getDocs(collection(db, "pushTokens"));
  const tokens = snap.docs.map((d) => d.data().token as string).filter(Boolean);
  for (let i = 0; i < tokens.length; i += 100) {
    const batch = tokens.slice(i, i + 100).map((to) => ({
      to,
      title: "🔴 Live from Atlanta Ayyappa Temple",
      body: title || "Live darshan is on now. Tap to watch.",
      sound: "default",
      channelId: "live",
      data: { type: "live" },
    }));
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(batch),
    });
  }
  return tokens.length;
}
