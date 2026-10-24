// One-time bulk upload of prepared wallpapers to Firebase Storage + Firestore.
// Usage: node scripts/upload-wallpapers.mjs /tmp/wall-final
// Asks for an admin username and password (password is hidden, never stored).
import { readFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const folder = process.argv[2];
if (!folder) throw new Error("Usage: node scripts/upload-wallpapers.mjs <folder>");

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
);
const app = initializeApp({
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
});

function ask(question, hidden = false) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) rl._writeToOutput = (s) => { if (s.includes(question)) process.stdout.write(s); };
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); if (hidden) process.stdout.write("\n"); resolve(answer.trim()); }));
}

const username = (await ask("Admin username: ")).toLowerCase();
const password = await ask("Admin password (hidden): ", true);
const email = username.includes("@") ? username : `${username}@admin.ayyappaseva.app`;
const auth = getAuth(app);
await signInWithEmailAndPassword(auth, email, password);
console.log("Signed in.");

const db = getFirestore(app);
const storage = getStorage(app);
const items = JSON.parse(readFileSync(path.join(folder, "manifest.json"), "utf8"));
const base = Date.now();

async function put(storagePath, file) {
  const reference = ref(storage, storagePath);
  await uploadBytes(reference, readFileSync(path.join(folder, file)), { contentType: "image/jpeg" });
  return getDownloadURL(reference);
}

for (const [i, item] of items.entries()) {
  const reference = doc(collection(db, "wallpapers"));
  const fullPath = `wallpapers/${reference.id}.jpg`;
  const thumbPath = `wallpapers/${reference.id}_thumb.jpg`;
  const url = await put(fullPath, `${item.file}.jpg`);
  const thumbUrl = await put(thumbPath, `${item.file}_thumb.jpg`);
  await setDoc(reference, {
    url,
    thumbUrl,
    path: fullPath,
    thumbPath,
    width: item.width,
    height: item.height,
    // Keep the original order: first photo shows first (list is newest-first).
    createdAt: new Date(base - i * 1000),
  });
  console.log(`${i + 1}/${items.length} uploaded`);
}
await signOut(auth);
console.log("Done.");
process.exit(0);
