import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import {
  initialSongs,
  initialUpdates,
  translations,
  type Copy,
} from "../data/content";
import { eventTranslations, initialCalendarEvents } from "../data/events";
import {
  cancelEventReminders,
  scheduleEventReminders,
} from "../services/eventNotifications";
import {
  addCalendarEvent,
  addTempleUpdate,
  firebaseConfigured,
  removeCalendarEvent,
  removeCalendarYear,
  revokeAdminAccess,
  setCalendarEventNotificationIds,
  signInAdmin,
  signOutAdmin,
  subscribeToAdmin,
  subscribeToAdminAccounts,
  subscribeToCalendarEvents,
  subscribeToUpdates,
  updateCalendarEvent,
} from "../services/firebase";
import type {
  AdminAccount,
  AdminSession,
  CalendarEvent,
  CalendarEventInput,
  Language,
  Song,
  Update,
} from "../types";

type AppState = {
  storageReady: boolean;
  cloudConfigured: boolean;
  cloudConnected: boolean;
  onboardingComplete: boolean;
  language: Language;
  t: Copy;
  songs: Song[];
  updates: Update[];
  events: CalendarEvent[];
  eventT: (typeof eventTranslations)[Language];
  registered: boolean;
  isAdmin: boolean;
  adminSession: AdminSession | null;
  adminAccounts: AdminAccount[];
  setLanguage: (language: Language) => void;
  finishOnboarding: (language: Language) => Promise<void>;
  replayWelcome: () => void;
  uploadSong: () => Promise<void>;
  register: () => void;
  authenticateAdmin: (username: string, password: string) => Promise<void>;
  leaveAdmin: () => Promise<void>;
  deleteAdminAccount: (uid: string) => Promise<void>;
  publishUpdate: (title: string, body: string) => Promise<void>;
  createCalendarEvent: (input: CalendarEventInput) => Promise<void>;
  editCalendarEvent: (id: string, input: CalendarEventInput) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  deleteCalendarYear: (year: number) => Promise<void>;
};

const Context = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [storageReady, setStorageReady] = useState(false);
  const [cloudConnected, setCloudConnected] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [language, setLanguageState] = useState<Language>("en");
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [updates, setUpdates] = useState<Update[]>(initialUpdates);
  const [events, setEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [registered, setRegistered] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.multiGet([
          "language",
          "songs",
          "updates",
          "calendarEvents",
          "registered",
          "admin",
          "onboardingComplete",
        ]);
        const values = Object.fromEntries(saved);
        if (values.language) setLanguageState(values.language as Language);
        if (values.songs) setSongs(JSON.parse(values.songs));
        if (values.updates) setUpdates(JSON.parse(values.updates));
        if (values.calendarEvents)
          setEvents(JSON.parse(values.calendarEvents));
        setRegistered(values.registered === "true");
        setOnboardingComplete(values.onboardingComplete === "true");
      } catch {
      } finally {
        setStorageReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!firebaseConfigured) return;
    const fail = (error: Error) => {
      setCloudConnected(false);
      console.warn("Firebase sync failed", error);
    };
    const stopEvents = subscribeToCalendarEvents((sharedEvents) => {
      setEvents(sharedEvents);
      setCloudConnected(true);
      void AsyncStorage.setItem("calendarEvents", JSON.stringify(sharedEvents));
    }, fail);
    const stopUpdates = subscribeToUpdates((sharedUpdates) => {
      setUpdates(sharedUpdates);
      setCloudConnected(true);
      void AsyncStorage.setItem("updates", JSON.stringify(sharedUpdates));
    }, fail);
    const stopAdmin = subscribeToAdmin((session) => {
      setAdminSession(session);
      setIsAdmin(Boolean(session));
    });
    return () => {
      stopEvents();
      stopUpdates();
      stopAdmin();
    };
  }, []);

  useEffect(() => {
    if (!firebaseConfigured || adminSession?.role !== "superAdmin") {
      setAdminAccounts([]);
      return;
    }
    return subscribeToAdminAccounts(setAdminAccounts, (error) => {
      console.warn("Unable to load administrator accounts", error);
      setAdminAccounts([]);
    });
  }, [adminSession?.role]);

  const setLanguage = (value: Language) => {
    setLanguageState(value);
    AsyncStorage.setItem("language", value);
  };
  const finishOnboarding = async (value: Language) => {
    setLanguageState(value);
    setOnboardingComplete(true);
    await AsyncStorage.multiSet([
      ["language", value],
      ["onboardingComplete", "true"],
    ]);
  };
  const replayWelcome = () => {
    setOnboardingComplete(false);
    AsyncStorage.removeItem("onboardingComplete");
  };
  const register = () => {
    setRegistered(true);
    AsyncStorage.setItem("registered", "true");
    Alert.alert("Swamiye Saranam Ayyappa", "Registration completed.");
  };
  const authenticateAdmin = async (username: string, password: string) => {
    const session = await signInAdmin(username, password);
    setAdminSession(session);
    setIsAdmin(true);
  };
  const leaveAdmin = async () => {
    await signOutAdmin();
    setAdminSession(null);
    setIsAdmin(false);
  };
  const deleteAdminAccount = async (uid: string) => {
    await revokeAdminAccess(uid);
    Alert.alert("Administrator removed", "The account can no longer access the admin section.");
  };
  const publishUpdate = async (title: string, body: string) => {
    await addTempleUpdate(title, body);
    Alert.alert("Update published");
  };
  const createCalendarEvent = async (input: CalendarEventInput) => {
    const id = await addCalendarEvent(input);
    const notificationIds = await scheduleEventReminders(
      { ...input, id, createdAt: new Date().toISOString() } as CalendarEvent,
      language,
    );
    if (notificationIds.length) {
      await setCalendarEventNotificationIds(id, notificationIds);
    }
  };
  const editCalendarEvent = async (id: string, input: CalendarEventInput) => {
    const existing = events.find((event) => event.id === id);
    if (!existing) throw new Error("This event is no longer available.");
    await cancelEventReminders(existing.notificationIds);
    await updateCalendarEvent(id, input);
    const notificationIds = await scheduleEventReminders(
      {
        ...input,
        id,
        createdAt: existing.createdAt,
      } as CalendarEvent,
      language,
    );
    await setCalendarEventNotificationIds(id, notificationIds);
  };
  const deleteCalendarEvent = async (id: string) => {
    const event = events.find((item) => item.id === id);
    await cancelEventReminders(event?.notificationIds);
    await removeCalendarEvent(id);
  };
  const deleteCalendarYear = async (year: number) => {
    const removed = events.filter(
      (event) => Number(event.date.slice(0, 4)) === year,
    );
    await Promise.all(
      removed.map((event) => cancelEventReminders(event.notificationIds)),
    );
    await removeCalendarYear(year);
  };
  const uploadSong = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    const kind: Song["type"] | null =
      lowerName.endsWith(".pdf") || file.mimeType?.includes("pdf")
        ? "PDF"
        : lowerName.endsWith(".docx") ||
            file.mimeType?.includes("officedocument.wordprocessingml.document")
          ? "DOCX"
          : lowerName.endsWith(".doc") || file.mimeType === "application/msword"
            ? "DOC"
            : null;
    try {
      if (!kind) {
        throw new Error("Choose a PDF, DOCX or DOC document.");
      }
      if (!FileSystem.documentDirectory)
        throw new Error("App storage is unavailable.");
      const id = String(Date.now());
      const extension =
        lowerName.match(/\.[a-z0-9]+$/)?.[0] ?? `.${kind.toLowerCase()}`;
      const storedUri = `${FileSystem.documentDirectory}devotional-${id}${extension}`;
      await FileSystem.copyAsync({ from: file.uri, to: storedUri });
      const added: Song = {
        id,
        title: file.name.replace(/\.[^/.]+$/, ""),
        subtitle: `${kind} · Saved on this device`,
        type: kind,
        uri: storedUri,
        size: file.size,
        mimeType: file.mimeType,
      };
      const next = [added, ...songs];
      setSongs(next);
      await AsyncStorage.setItem("songs", JSON.stringify(next));
      Alert.alert(
        "Added to sacred library",
        kind === "DOC"
          ? `${file.name}\n\nThe document is now listed under Songs. Legacy DOC files open through a compatible document app on the device.`
          : `${file.name}\n\nIt is now available under Songs and saved on this device.`,
      );
    } catch (reason) {
      Alert.alert(
        "Unable to save file",
        reason instanceof Error ? reason.message : "Please try another file.",
      );
    }
  };

  const value = useMemo<AppState>(
    () => ({
      storageReady,
      cloudConfigured: firebaseConfigured,
      cloudConnected,
      onboardingComplete,
      language,
      t: translations[language],
      songs,
      updates,
      events,
      eventT: eventTranslations[language],
      registered,
      isAdmin,
      adminSession,
      adminAccounts,
      setLanguage,
      finishOnboarding,
      replayWelcome,
      uploadSong,
      register,
      authenticateAdmin,
      leaveAdmin,
      deleteAdminAccount,
      publishUpdate,
      createCalendarEvent,
      editCalendarEvent,
      deleteCalendarEvent,
      deleteCalendarYear,
    }),
    [
      storageReady,
      cloudConnected,
      onboardingComplete,
      language,
      songs,
      updates,
      events,
      registered,
      isAdmin,
      adminSession,
      adminAccounts,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
