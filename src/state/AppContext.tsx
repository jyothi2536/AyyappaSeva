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
import type { Language, Song, Update } from "../types";

type AppState = {
  storageReady: boolean;
  onboardingComplete: boolean;
  language: Language;
  t: Copy;
  songs: Song[];
  updates: Update[];
  registered: boolean;
  isAdmin: boolean;
  setLanguage: (language: Language) => void;
  finishOnboarding: (language: Language) => Promise<void>;
  replayWelcome: () => void;
  uploadSong: () => Promise<void>;
  register: () => void;
  authenticateAdmin: () => void;
  leaveAdmin: () => void;
  publishUpdate: (title: string, body: string) => void;
};

const Context = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [storageReady, setStorageReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [language, setLanguageState] = useState<Language>("en");
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [updates, setUpdates] = useState<Update[]>(initialUpdates);
  const [registered, setRegistered] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.multiGet([
          "language",
          "songs",
          "updates",
          "registered",
          "admin",
          "onboardingComplete",
        ]);
        const values = Object.fromEntries(saved);
        if (values.language) setLanguageState(values.language as Language);
        if (values.songs) setSongs(JSON.parse(values.songs));
        if (values.updates) setUpdates(JSON.parse(values.updates));
        setRegistered(values.registered === "true");
        setIsAdmin(values.admin === "true");
        setOnboardingComplete(values.onboardingComplete === "true");
      } catch {
      } finally {
        setStorageReady(true);
      }
    })();
  }, []);

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
  const authenticateAdmin = () => {
    setIsAdmin(true);
    AsyncStorage.setItem("admin", "true");
  };
  const leaveAdmin = () => {
    setIsAdmin(false);
    AsyncStorage.setItem("admin", "false");
  };
  const publishUpdate = (title: string, body: string) => {
    const next = [
      { id: String(Date.now()), title, body, date: "Today", pinned: true },
      ...updates,
    ];
    setUpdates(next);
    AsyncStorage.setItem("updates", JSON.stringify(next));
    Alert.alert("Update published");
  };
  const uploadSong = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/*",
        "audio/*",
      ],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    const kind: Song["type"] =
      lowerName.endsWith(".pdf") || file.mimeType?.includes("pdf")
        ? "PDF"
        : lowerName.endsWith(".docx") ||
            file.mimeType?.includes("officedocument.wordprocessingml.document")
          ? "DOCX"
          : file.mimeType?.startsWith("audio")
            ? "AUDIO"
            : "TXT";
    try {
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
        `${file.name}\n\nTap it to read inside the app.`,
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
      onboardingComplete,
      language,
      t: translations[language],
      songs,
      updates,
      registered,
      isAdmin,
      setLanguage,
      finishOnboarding,
      replayWelcome,
      uploadSong,
      register,
      authenticateAdmin,
      leaveAdmin,
      publishUpdate,
    }),
    [
      storageReady,
      onboardingComplete,
      language,
      songs,
      updates,
      registered,
      isAdmin,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
