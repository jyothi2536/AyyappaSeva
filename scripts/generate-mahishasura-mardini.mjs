import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tempDirectory = resolve(root, "tmp/pdfs");
const outputDirectory = resolve(root, "output/pdf");
const htmlPath = resolve(tempDirectory, "mahishasura-mardini-stotram.html");
const pdfPath = resolve(
  outputDirectory,
  "sri-mahishasura-mardini-stotram-four-languages.pdf",
);
const appAssetPath = resolve(
  root,
  "assets/documents/sri-mahishasura-mardini-stotram-four-languages.pdf",
);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl =
  "https://vedictithi.com/scriptures/sri-mahishasura-mardini-stotram-ayigiri-nandini";

const editions = [
  {
    key: "iast",
    tab: "ENGLISH",
    heading: "English transliteration",
    font: '"Palatino Linotype", Palatino, Georgia, serif',
  },
  {
    key: "telugu",
    tab: "తెలుగు",
    heading: "తెలుగు లిపి",
    font: '"Kohinoor Telugu", "Telugu Sangam MN", "Arial Unicode MS", sans-serif',
  },
  {
    key: "tamil",
    tab: "தமிழ்",
    heading: "தமிழ் எழுத்து",
    font: '"Tamil Sangam MN", "Tamil MN", "Arial Unicode MS", sans-serif',
  },
  {
    key: "kannada",
    tab: "ಕನ್ನಡ",
    heading: "ಕನ್ನಡ ಲಿಪಿ",
    font: '"Kannada Sangam MN", "Kannada MN", "Arial Unicode MS", sans-serif',
  },
];

function downloadEdition(key) {
  return execFileSync("curl", [
    "-L",
    "--fail",
    "--silent",
    "--show-error",
    `${baseUrl}?script=${key}`,
  ], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
}

function extractLyrics(html, key) {
  const match = html.match(
    /<div class="stotram-content[^>]*>([\s\S]*?)<\/div>/,
  );
  if (!match) throw new Error(`Unable to extract the ${key} lyrics.`);

  const paragraphs = [...match[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map(
    ([, value]) => value
      .replace(/<[^>]+>/g, "")
      .replaceAll("&quot;", '"')
      .replaceAll("&#x27;", "'")
      .replaceAll("&#39;", "'")
      .replaceAll("&amp;", "&")
      .replace(/\s*\[[^\]]+\]\s*$/u, "")
      .trim(),
  );
  if (paragraphs.length < 80) {
    throw new Error(`${key} returned only ${paragraphs.length} lyric lines.`);
  }
  return paragraphs;
}

function groupVerses(lines) {
  const verses = [];
  for (let index = 0; index < lines.length; index += 4) {
    verses.push(lines.slice(index, index + 4));
  }
  return verses;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

mkdirSync(tempDirectory, { recursive: true });
mkdirSync(outputDirectory, { recursive: true });

const sections = editions.map((edition) => {
  const lines = extractLyrics(downloadEdition(edition.key), edition.key);
  const verses = groupVerses(lines)
    .map(
      (verse) =>
        `<div class="verse">${verse
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join("")}</div>`,
    )
    .join("");
  return `<section class="language" style="--body-font: ${edition.font}">
    <header class="section-header">
      <span class="language-tab">${edition.tab}</span>
      <h2>${edition.heading}</h2>
      <p>21 verses - traditional devotional hymn</p>
    </header>
    <main>${verses}</main>
  </section>`;
});

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Sri Mahishasura Mardini Stotram</title>
  <style>
    @page { size: A4; margin: 17mm 15mm 18mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #241b0d; background: #fffdf7; font-family: Arial, sans-serif; }
    .cover { height: 245mm; display: flex; flex-direction: column; justify-content: center; text-align: center; page-break-after: always; padding: 20mm; border: 2px solid #bd8514; background: linear-gradient(145deg, #fffaf0, #f5dfaa); }
    .om { color: #a66508; font-size: 50pt; line-height: 1; margin-bottom: 15mm; }
    h1 { margin: 0; color: #402707; font-family: Georgia, serif; font-size: 31pt; line-height: 1.18; }
    .cover .alias { margin: 7mm 0 0; color: #8a5a0b; font-size: 17pt; }
    .rule { width: 52mm; height: 2px; background: #bd8514; margin: 13mm auto; }
    .languages { font-size: 13pt; line-height: 1.8; font-weight: 700; }
    .note { margin-top: auto; color: #6f6045; font-size: 9pt; line-height: 1.5; }
    .language { font-family: var(--body-font); page-break-before: always; }
    .section-header { border-bottom: 2px solid #c28a1b; padding-bottom: 6mm; margin-bottom: 8mm; }
    .language-tab { display: inline-block; background: #3b2709; color: #f7ca5c; border-radius: 12px; padding: 3mm 6mm; font-family: Arial, sans-serif; font-size: 10pt; font-weight: 800; letter-spacing: .8px; }
    h2 { color: #442b07; font-size: 24pt; margin: 5mm 0 1.5mm; line-height: 1.25; }
    .section-header p { color: #7b6848; font-family: Arial, sans-serif; font-size: 9.5pt; margin: 0; }
    .verse { page-break-inside: avoid; margin: 0 0 7mm; padding: 0 0 5mm 5mm; border-left: 2px solid #e3bd63; }
    .verse p { margin: 0 0 2.2mm; font-size: 12.5pt; line-height: 1.55; }
    footer { display: none; }
  </style>
</head>
<body>
  <section class="cover">
    <div class="om">ॐ</div>
    <h1>Sri Mahishasura<br>Mardini Stotram</h1>
    <p class="alias">Ayigiri Nandini</p>
    <div class="rule"></div>
    <p class="languages">English - తెలుగు - தமிழ் - ಕನ್ನಡ</p>
    <p class="note">Prepared for offline devotional reading in Ayyappa Seva.<br>Traditional 21-verse Sanskrit hymn presented in four reading scripts.</p>
  </section>
  ${sections.join("\n")}
</body>
</html>`;

writeFileSync(htmlPath, html, "utf8");
rmSync(pdfPath, { force: true });
execFileSync(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${pdfPath}`,
  `file://${htmlPath}`,
], { stdio: "inherit" });

const size = readFileSync(pdfPath).length;
if (size < 20_000) throw new Error(`Generated PDF is unexpectedly small: ${size}`);
copyFileSync(pdfPath, appAssetPath);
console.log(`${pdfPath} (${Math.round(size / 1024)} KB)`);
