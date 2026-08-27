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
export async function prepareBuiltInDocument(document: BuiltInDocument) {
  if (!FileSystem.documentDirectory)
    throw new Error("App storage is unavailable.");
  const destination = `${FileSystem.documentDirectory}offline-${document.id}.${document.type.toLowerCase()}`;
  const existing = await FileSystem.getInfoAsync(destination);
  if (existing.exists) return destination;
  const asset = Asset.fromModule(document.assetSource);
  await asset.downloadAsync();
  const source = asset.localUri ?? asset.uri;
  if (!source) throw new Error("The bundled document could not be prepared.");
  await FileSystem.copyAsync({ from: source, to: destination });
  return destination;
}
