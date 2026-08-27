import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import {
  getAuth,
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
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import type { CalendarEvent, CalendarEventInput, Update } from "../types";

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

export async function addTempleUpdate(title: string, body: string) {
  await addDoc(collection(requireDb(), "updates"), {
    title,
    body,
    date: "Today",
    pinned: true,
    createdAt: serverTimestamp(),
  });
}

async function isApprovedAdmin(uid: string) {
  return (await getDoc(doc(requireDb(), "admins", uid))).exists();
}

export function subscribeToAdmin(receive: (isAdmin: boolean) => void) {
  if (!auth) {
    receive(false);
    return () => undefined;
  }
  return onAuthStateChanged(auth, async (user) => {
    receive(user ? await isApprovedAdmin(user.uid).catch(() => false) : false);
  });
}

export async function signInAdmin(email: string, password: string) {
  const instance = requireAuth();
  const credential = await signInWithEmailAndPassword(instance, email, password);
  if (!(await isApprovedAdmin(credential.user.uid))) {
    await signOut(instance);
    throw new Error("This account is not approved as a temple administrator.");
  }
}

export async function signOutAdmin() {
  await signOut(requireAuth());
}
