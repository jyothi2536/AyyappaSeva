// Builds song-library/telugu/<id>.pdf from tmp/pdfs/<id>.txt and appends its telugu-manifest.json entry.
//   node scripts/add-telugu-song.mjs <id> "<Title>" <Section> <deity>
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [id, title, section, deity] = process.argv.slice(2);
if (!id || !title || !section || !deity) throw new Error('Usage: add-telugu-song.mjs <id> "<Title>" <Section> <deity>');
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const stanzas = readFileSync(resolve(root, `tmp/pdfs/${id}.txt`), "utf8")
  .trim()
  .split(/\n\s*\n/)
  .map((b) => `<p>${b.split("\n").map(esc).join("<br>")}</p>`)
  .join("\n");
const htmlPath = resolve(root, `tmp/pdfs/${id}.html`);
writeFileSync(
  htmlPath,
  `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
@page{size:A4;margin:18mm}body{font-family:Georgia,serif;color:#2b1a0a;text-align:center}
h1{color:#a53d15;margin:0 0 4px;font-size:26px}.sub{color:#88530d;margin-bottom:18px;font-size:13px}
p{font-size:16px;line-height:1.7;margin:0 0 14px}</style></head><body>
<h1>${esc(title)}</h1><div class="sub">${esc(section)} · Telugu · Bhajan lyrics</div>
${stanzas}
</body></html>`,
);
const file = `${id}.pdf`;
const pdfPath = resolve(root, `song-library/telugu/${file}`);
execFileSync(chrome, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, `file://${htmlPath}`], { stdio: "ignore" });
if (!existsSync(pdfPath)) throw new Error("PDF was not generated");

const manifestPath = resolve(root, "song-library/telugu-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const size = statSync(pdfPath).size;
const existing = manifest.find((x) => x.id === id);
if (existing) existing.size = size;
else manifest.push({ id, title, subtitle: "Telugu · Bhajan lyrics", section, deity, lang: "te", file, size, order: Math.max(...manifest.map((x) => x.order)) + 1 });
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + "\n");
console.log(`OK ${file} (${size} bytes), manifest entries: ${manifest.length}`);
