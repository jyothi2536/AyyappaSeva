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
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import type {
  AdminAccount,
  AdminRole,
  AdminSession,
  CalendarEvent,
  CalendarEventInput,
  Update,
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
