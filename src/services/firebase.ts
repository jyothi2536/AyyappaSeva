import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import {
  getAuth,
  createUserWithEmailAndPassword,
  deleteUser,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import type {
  AdminAccount,
  AdminRole,
  AdminSession,
  CalendarEvent,
  CalendarEventInput,
  TodaySchedule,
  Update,
  Wallpaper,
  WeeklySchedule,
} from "../types";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);

const app = firebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const db = app
    ? initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      experimentalForceLongPolling: true,
    })
  : null;

let auth: Auth | null = null;
if (app) {
  try {
    const getReactNativePersistence = (
      FirebaseAuth as unknown as {
        getReactNativePersistence: (storage: typeof AsyncStorage) => never;
      }
    ).getReactNativePersistence;
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
}

function requireDb() {
  if (!db) {
    throw new Error(
      "Firebase is not configured. Add the EXPO_PUBLIC_FIREBASE_* values to .env and restart Expo.",
    );
  }
  return db;
}

function requireAuth() {
  if (!auth) throw new Error("Firebase is not configured.");
  return auth;
}

function timestampToIso(value: unknown) {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }
  return new Date().toISOString();
}

function calendarEventFromDoc(id: string, value: DocumentData): CalendarEvent {
  return {
    ...value,
    id,
    createdAt: timestampToIso(value.createdAt),
  } as CalendarEvent;
}

export function subscribeToCalendarEvents(
  receive: (events: CalendarEvent[]) => void,
  fail: (error: Error) => void,
): Unsubscribe {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, "events"),
    (snapshot) => {
      const events = snapshot.docs
        .map((item) => calendarEventFromDoc(item.id, item.data()))
        .sort((a, b) =>
          `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`),
        );
      receive(events);
    },
    (error) => fail(error),
  );
}

export async function addCalendarEvent(input: CalendarEventInput) {
  const database = requireDb();
  const reference = await addDoc(collection(database, "events"), {
    ...input,
    year: Number(input.date.slice(0, 4)),
    createdAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateCalendarEvent(
  id: string,
  input: CalendarEventInput,
) {
  await updateDoc(doc(requireDb(), "events", id), {
    ...input,
    year: Number(input.date.slice(0, 4)),
    updatedAt: serverTimestamp(),
  });
}

export async function setCalendarEventNotificationIds(
  id: string,
  notificationIds: string[],
) {
  await updateDoc(doc(requireDb(), "events", id), { notificationIds });
}

export async function removeCalendarEvent(id: string) {
  await deleteDoc(doc(requireDb(), "events", id));
}

export async function removeCalendarYear(year: number) {
  const database = requireDb();
  const result = await getDocs(
    query(collection(database, "events"), where("year", "==", year)),
  );
  for (let start = 0; start < result.docs.length; start += 450) {
    const batch = writeBatch(database);
    result.docs.slice(start, start + 450).forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }
}

export function subscribeToTodaySchedule(
  receive: (schedule: TodaySchedule | null) => void,
  fail: (error: Error) => void,
): Unsubscribe {
  if (!db) return () => undefined;
  return onSnapshot(
    doc(db, "today", "current"),
    (snapshot) => {
      if (!snapshot.exists()) return receive(null);
      const { updatedAt: _ignored, ...rest } = snapshot.data();
      receive(rest as TodaySchedule);
    },
    (error) => fail(error),
  );
}

export async function saveTodaySchedule(schedule: TodaySchedule) {
  await setDoc(doc(requireDb(), "today", "current"), {
    ...schedule,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToWeeklySchedule(
  receive: (schedule: WeeklySchedule | null) => void,
  fail: (error: Error) => void,
): Unsubscribe {
  if (!db) return () => undefined;
  return onSnapshot(
    doc(db, "today", "weekly"),
    (snapshot) => {
      if (!snapshot.exists()) return receive(null);
      const { updatedAt: _ignored, ...rest } = snapshot.data();
      receive(rest as WeeklySchedule);
    },
    (error) => fail(error),
  );
}

export async function saveWeeklySchedule(schedule: WeeklySchedule) {
  await setDoc(doc(requireDb(), "today", "weekly"), {
    ...schedule,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToUpdates(
  receive: (updates: Update[]) => void,
  fail: (error: Error) => void,
): Unsubscribe {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, "updates"),
    (snapshot) => {
      const updates = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }) as Update & { createdAt?: unknown })
        .sort((a, b) => timestampToIso(b.createdAt).localeCompare(timestampToIso(a.createdAt)));
      receive(updates);
    },
    (error) => fail(error),
  );
}

// ---- Live stream switch (admin turns it on/off, all apps listen) -------------

export type LiveState = {
  active: boolean;
  videoId: string | null;
  title: string;
};

export function subscribeToLive(receive: (live: LiveState | null) => void): Unsubscribe {
  if (!db) return () => undefined;
  return onSnapshot(
    doc(db, "live", "current"),
    (snapshot) => {
      const data = snapshot.data();
      if (!snapshot.exists() || !data?.active) return receive(null);
      receive({
        active: true,
        videoId: typeof data.videoId === "string" && data.videoId ? data.videoId : null,
        title: typeof data.title === "string" ? data.title : "",
      });
    },
    () => receive(null),
  );
}

export async function setLive(live: LiveState) {
  await setDoc(doc(requireDb(), "live", "current"), {
    ...live,
    updatedAt: serverTimestamp(),
  });
}

export type PhotoRef = { url: string; path: string };

async function uploadJpeg(path: string, localUri: string) {
  if (!app) throw new Error("Firebase is not configured.");
  const blob = await (await fetch(localUri)).blob();
  const reference = storageRef(getStorage(app), path);
  await uploadBytes(reference, blob, { contentType: "image/jpeg" });
  return getDownloadURL(reference);
}

/** Uploads one admin photo (already resized to JPEG) for a Today row or an Update. */
export async function uploadEventPhoto(folder: "today" | "updates", localUri: string): Promise<PhotoRef> {
  const name = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const path = `${folder}/${name}`;
  return { url: await uploadJpeg(path, localUri), path };
}

export async function deleteEventPhoto(path?: string) {
  if (!app || !path) return;
  await deleteObject(storageRef(getStorage(app), path)).catch(() => undefined);
}

export async function addTempleUpdate(title: string, body: string, photo?: PhotoRef | null) {
  await addDoc(collection(requireDb(), "updates"), {
    title,
    body,
    date: "Today",
    pinned: true,
    ...(photo ? { imageUrl: photo.url, imagePath: photo.path } : {}),
    createdAt: serverTimestamp(),
  });
}

/** `photo`: a new photo, `null` to remove the current one, `undefined` to leave it unchanged. */
export async function editTempleUpdate(id: string, title: string, body: string, photo?: PhotoRef | null) {
  await updateDoc(doc(requireDb(), "updates", id), {
    title,
    body,
    ...(photo ? { imageUrl: photo.url, imagePath: photo.path } : {}),
    ...(photo === null ? { imageUrl: deleteField(), imagePath: deleteField() } : {}),
  });
}

export async function removeTempleUpdate(update: Update) {
  await deleteDoc(doc(requireDb(), "updates", update.id));
  await deleteEventPhoto(update.imagePath);
}

// ---- Wallpapers (images in Storage, list in Firestore) ----------------------

export function subscribeToWallpapers(
  receive: (wallpapers: Wallpaper[]) => void,
  fail: (error: Error) => void,
): Unsubscribe {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, "wallpapers"),
    (snapshot) => {
      receive(
        snapshot.docs
          .map((item) => {
            const value = item.data();
            return {
              ...value,
              id: item.id,
              createdAt: timestampToIso(value.createdAt),
            } as Wallpaper;
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    },
    fail,
  );
}

export type WallpaperUpload = {
  uri: string;
  thumbUri: string;
  width: number;
  height: number;
};

export async function addWallpaper(image: WallpaperUpload) {
  const database = requireDb();
  const reference = doc(collection(database, "wallpapers"));
  const path = `wallpapers/${reference.id}.jpg`;
  const thumbPath = `wallpapers/${reference.id}_thumb.jpg`;
  const url = await uploadJpeg(path, image.uri);
  const thumbUrl = await uploadJpeg(thumbPath, image.thumbUri);
  await setDoc(reference, {
    url,
    thumbUrl,
    path,
    thumbPath,
    width: image.width,
    height: image.height,
    createdAt: serverTimestamp(),
  });
}

export async function removeWallpaper(wallpaper: Wallpaper) {
  if (!app) throw new Error("Firebase is not configured.");
  const storage = getStorage(app);
  await deleteDoc(doc(requireDb(), "wallpapers", wallpaper.id));
  await Promise.all(
    [wallpaper.path, wallpaper.thumbPath].map((path) =>
      deleteObject(storageRef(storage, path)).catch(() => undefined),
    ),
  );
}

function usernameToFirebaseEmail(username: string) {
  const normalized = username.trim().toLowerCase();
  if (normalized.includes("@")) return normalized;
  if (!/^[a-z0-9._-]{3,40}$/.test(normalized)) {
    throw new Error(
      "Use 3–40 letters, numbers, dots, underscores or hyphens for the username.",
    );
  }
  return `${normalized}@admin.ayyappaseva.app`;
}

function adminFromDoc(uid: string, value: DocumentData): AdminSession | null {
  // Older approved administrator documents did not contain an explicit role.
  // Because only the Firebase console can create these documents, keep them
  // working as normal admins while reserving super-admin access for the exact
  // role value below.
  const role: AdminRole = value.role === "superAdmin" ? "superAdmin" : "admin";
  return {
    uid,
    username: String(value.username || value.email || uid),
    displayName: String(value.displayName || value.username || "Administrator"),
    role,
  };
}

export function subscribeToAdmin(
  receive: (session: AdminSession | null) => void,
) {
  if (!auth) {
    receive(null);
    return () => undefined;
  }
  let stopAdminDocument: Unsubscribe | undefined;
  const stopAuth = onAuthStateChanged(auth, (user) => {
    stopAdminDocument?.();
    stopAdminDocument = undefined;
    if (!user) {
      receive(null);
      return;
    }
    stopAdminDocument = onSnapshot(
      doc(requireDb(), "admins", user.uid),
      (snapshot) => {
        receive(snapshot.exists() ? adminFromDoc(user.uid, snapshot.data()) : null);
      },
      () => receive(null),
    );
  });
  return () => {
    stopAdminDocument?.();
    stopAuth();
  };
}

export async function signInAdmin(username: string, password: string) {
  const instance = requireAuth();
  const credential = await signInWithEmailAndPassword(
    instance,
    usernameToFirebaseEmail(username),
    password,
  );
  const adminDocument = await getDoc(
    doc(requireDb(), "admins", credential.user.uid),
  );
  const approved = adminDocument.exists()
    ? adminFromDoc(credential.user.uid, adminDocument.data())
    : null;
  if (!approved) {
    await signOut(instance);
    throw new Error("This account is not approved as a temple administrator.");
  }
  return approved;
}

export async function signOutAdmin() {
  await signOut(requireAuth());
}

export function subscribeToAdminAccounts(
  receive: (accounts: AdminAccount[]) => void,
  fail: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, "admins"),
    (snapshot) => {
      receive(
        snapshot.docs
          .map((item) => adminFromDoc(item.id, item.data()))
          .filter((item): item is AdminAccount => Boolean(item))
          .sort((a, b) => a.displayName.localeCompare(b.displayName)),
      );
    },
    fail,
  );
}

export async function revokeAdminAccess(uid: string) {
  const currentUser = requireAuth().currentUser;
  if (!currentUser) throw new Error("Sign in again to continue.");
  if (uid === currentUser.uid) {
    throw new Error("The super administrator cannot delete their own account.");
  }
  await deleteDoc(doc(requireDb(), "admins", uid));
}

// ---- Devotee (end-user) accounts -------------------------------------------

const DEVOTEE_DOMAIN = "devotee.ayyappaseva.app";

export function usernameToDevoteeEmail(username: string) {
  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,40}$/.test(normalized)) {
    throw new Error(
      "Use 3–40 letters, numbers, dots, underscores or hyphens for the username.",
    );
  }
  return `${normalized}@${DEVOTEE_DOMAIN}`;
}

export type DevoteeSession = { uid: string; username: string; expiresAt: number };

export const DEVOTEE_SESSION_MS = 60 * 60 * 1000; // 1 hour
const DEVOTEE_LOGIN_AT_KEY = "devoteeLoginAt";

async function devoteeExpiry() {
  const value = Number(await AsyncStorage.getItem(DEVOTEE_LOGIN_AT_KEY));
  return value ? value + DEVOTEE_SESSION_MS : 0;
}

/** Signs the devotee out if their 1-hour session has ended. Returns true if signed out. */
export async function enforceDevoteeSessionExpiry() {
  const user = auth?.currentUser;
  if (!user?.email?.endsWith(`@${DEVOTEE_DOMAIN}`)) return false;
  if (Date.now() < (await devoteeExpiry())) return false;
  await signOutDevotee();
  return true;
}

export function subscribeToDevotee(receive: (session: DevoteeSession | null) => void) {
  if (!auth) {
    receive(null);
    return () => undefined;
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  let active = true;
  const stop = onAuthStateChanged(auth, (user) => {
    if (timer) clearTimeout(timer);
    const email = user?.email ?? "";
    if (!user || !email.endsWith(`@${DEVOTEE_DOMAIN}`)) {
      receive(null);
      return;
    }
    void devoteeExpiry().then((expiresAt) => {
      if (!active) return;
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        receive(null);
        void signOutDevotee();
        return;
      }
      receive({ uid: user.uid, username: email.split("@")[0]!, expiresAt });
      timer = setTimeout(() => void enforceDevoteeSessionExpiry(), remaining + 500);
    });
  });
  return () => {
    active = false;
    if (timer) clearTimeout(timer);
    stop();
  };
}

export async function signInDevotee(username: string, password: string) {
  await AsyncStorage.setItem(DEVOTEE_LOGIN_AT_KEY, String(Date.now()));
  try {
    await signInWithEmailAndPassword(requireAuth(), usernameToDevoteeEmail(username), password);
  } catch (reason) {
    await AsyncStorage.removeItem(DEVOTEE_LOGIN_AT_KEY);
    throw reason;
  }
}

export async function signOutDevotee() {
  await AsyncStorage.removeItem(DEVOTEE_LOGIN_AT_KEY);
  await signOut(requireAuth());
}

export type DevoteeProfileInput = {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  address?: string;
  phone: string;
};

/** Creates the devotee account + profile document, then signs out so the user logs in explicitly. */
export async function createDevoteeAccount(input: DevoteeProfileInput) {
  const instance = requireAuth();
  const username = input.username.trim().toLowerCase();
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(
      instance,
      usernameToDevoteeEmail(username),
      input.password,
    );
  } catch (reason) {
    const code = (reason as { code?: string })?.code ?? "";
    if (code === "auth/email-already-in-use") throw new Error("That username is already taken.");
    if (code === "auth/weak-password") throw new Error("Password must be at least 6 characters.");
    throw reason;
  }
  try {
    // Make sure Firestore sees the brand-new login before writing the profile.
    await credential.user.getIdToken(true);
    await setDoc(doc(requireDb(), "devotees", credential.user.uid), {
      username,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      address: input.address?.trim() ?? "",
      phone: input.phone.trim(),
      createdAt: serverTimestamp(),
    });
  } catch (reason) {
    // Roll back the login so the username can be used again.
    await deleteUser(credential.user).catch(() => undefined);
    throw reason;
  } finally {
    await signOut(instance).catch(() => undefined);
  }
}
