// Uploads song-library/njabm PDFs to Firebase Storage and lists them in Firestore ("songs").
// Safe to re-run: songs already in Firestore are skipped.
//   ADMIN_USER=<username> ADMIN_PASS=<password> node scripts/upload-song-library.mjs
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env };
if (existsSync(resolve(root, ".env"))) {
  for (const line of readFileSync(resolve(root, ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r]*)"?\s*$/);
    if (m && !(m[1] in env)) env[m[1]] = m[2];
  }
}
const cfg = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
if (!Object.values(cfg).every(Boolean)) throw new Error("Missing EXPO_PUBLIC_FIREBASE_* values (.env).");
if (!env.ADMIN_USER || !env.ADMIN_PASS) throw new Error("Set ADMIN_USER and ADMIN_PASS.");

const app = initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
await signInWithEmailAndPassword(
  auth,
  `${env.ADMIN_USER.trim().toLowerCase()}@admin.ayyappaseva.app`,
  env.ADMIN_PASS,
);
console.log("Signed in as admin.");

// Usage: node scripts/upload-song-library.mjs [manifest] [folder]
//   default: song-library/manifest.json + song-library/njabm
//   shiva:   song-library/shiva-manifest.json song-library/shiva
const manifestPath = process.argv[2] ?? "song-library/manifest.json";
const folder = process.argv[3] ?? "song-library/njabm";
const manifest = JSON.parse(readFileSync(resolve(root, manifestPath), "utf8"));
let done = 0;
let skipped = 0;
let failed = 0;
let next = 0;
async function worker() {
  while (next < manifest.length) {
    const s = manifest[next++];
    try {
      if ((await getDoc(doc(db, "songs", s.id))).exists()) {
        skipped++;
        continue;
      }
      const path = `songs/${s.file}`;
      const bytes = readFileSync(resolve(root, folder, s.file));
      await uploadBytes(ref(storage, path), bytes, { contentType: "application/pdf" });
      const url = await getDownloadURL(ref(storage, path));
      await setDoc(doc(db, "songs", s.id), {
        title: s.title,
        subtitle: s.subtitle ?? `NJABM Bhajan Book · Tamil + English · ${s.section}`,
        section: s.section,
        deity: s.deity,
        lang: s.lang,
        url,
        path,
        size: s.size,
        order: s.order,
        createdAt: serverTimestamp(),
      });
      done++;
    } catch (e) {
      failed++;
      console.error(`FAILED ${s.id}: ${e.message}`);
    }
    if ((done + skipped + failed) % 25 === 0) console.log(`${done + skipped + failed}/${manifest.length}`);
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
console.log(`Uploaded ${done}, already there ${skipped}, failed ${failed}.`);
process.exit(failed ? 1 : 0);
