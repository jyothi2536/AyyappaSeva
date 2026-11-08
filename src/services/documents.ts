import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import JSZip from "jszip";
import type { BuiltInDocument } from "../types";

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}
export async function readDocx(uri: string) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const zip = await JSZip.loadAsync(base64, { base64: true });
  const document = zip.file("word/document.xml");
  if (!document)
    throw new Error("This DOCX file does not contain a readable document.");
  const xml = await document.async("text");
  const paragraphs = xml
    .split(/<\/w:p>/i)
    .map((p) =>
      decodeXml(
        p
          .replace(/<w:tab\s*\/>/gi, "\t")
          .replace(/<w:br[^>]*\/>/gi, "\n")
          .replace(/<[^>]+>/g, ""),
      ),
    )
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paragraphs.length)
    throw new Error("No readable text was found in this DOCX file.");
  return paragraphs.join("\n\n");
}
/**
 * Returns a readable file path for a bundled book without making a copy.
 * On iOS this is the file inside the app itself; on Android expo-asset
 * unpacks it once into the cache.
 */
export async function prepareBuiltInDocument(document: BuiltInDocument) {
  const asset = Asset.fromModule(document.assetSource);
  await asset.downloadAsync();
  const source = asset.localUri ?? asset.uri;
  if (!source) throw new Error("The bundled document could not be prepared.");
  return source;
}

const songDir = () => `${FileSystem.documentDirectory}library/`;
const songPath = (id: string) => `${songDir()}${id}.pdf`;

/** Ids of the cloud songs the devotee chose to download for offline use. */
export async function listDownloadedSongs() {
  const names = await FileSystem.readDirectoryAsync(songDir()).catch(() => [] as string[]);
  return new Set(names.filter((n) => n.endsWith(".pdf")).map((n) => n.slice(0, -4)));
}

/** Saves a cloud song on the phone so it opens without internet. */
export async function downloadSong(id: string, url: string) {
  await FileSystem.makeDirectoryAsync(songDir(), { intermediates: true }).catch(() => undefined);
  const path = songPath(id);
  const partial = `${path}.part`;
  try {
    const result = await FileSystem.downloadAsync(url, partial);
    if (result.status !== 200) throw new Error("download failed");
    await FileSystem.moveAsync({ from: partial, to: path });
  } catch {
    await FileSystem.deleteAsync(partial, { idempotent: true }).catch(() => undefined);
    throw new Error("Could not download this song. Check your internet connection.");
  }
}

export async function removeDownloadedSong(id: string) {
  await FileSystem.deleteAsync(songPath(id), { idempotent: true }).catch(() => undefined);
}

/** Local file when downloaded, otherwise the online link (streamed each time). */
export async function resolveCloudSong(id: string, url: string, downloaded: boolean) {
  if (downloaded) {
    const info = await FileSystem.getInfoAsync(songPath(id));
    if (info.exists) return songPath(id);
  }
  return url;
}

/** Removes the full copies older versions saved in app storage (about 19 MB). */
async function removeOldCopies() {
  const dir = FileSystem.documentDirectory;
  if (!dir) return;
  const names = await FileSystem.readDirectoryAsync(dir).catch(() => [] as string[]);
  await Promise.all(
    names
      .filter((name) => name.startsWith("offline-"))
      .map((name) => FileSystem.deleteAsync(`${dir}${name}`, { idempotent: true }).catch(() => undefined)),
  );
}

let preparingAll: Promise<void> | null = null;
/** Makes every bundled book ready to open (once per launch). */
export function prepareAllBuiltInDocuments(documents: BuiltInDocument[]) {
  if (!preparingAll) {
    preparingAll = (async () => {
      await removeOldCopies();
      for (const document of documents) {
        await prepareBuiltInDocument(document).catch(() => undefined);
      }
    })();
  }
  return preparingAll;
}
