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
const assetDirectory = resolve(root, "assets/documents");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sourceRoot = "https://vedictithi.com/scriptures";

const documents = [
  {
    slug: "lingashtakam",
    filename: "lingashtakam-four-languages.pdf",
    title: "Lingashtakam",
    alias: "Eight verses in praise of the Shiva Linga",
    count: "8 verses and closing prayer",
    accent: "#88530d",
  },
  {
    slug: "bilvaashtakam",
    filename: "bilvashtakam-four-languages.pdf",
    title: "Bilvashtakam",
    alias: "Eight verses for the sacred Bilva offering",
    count: "8 verses",
    accent: "#49743c",
    useAlternativeSection: true,
  },
  {
    slug: "hanuman-chalisa",
    filename: "hanuman-chalisa-four-languages.pdf",
    title: "Hanuman Chalisa",
    alias: "Sri Hanuman devotional hymn",
    count: "40 verses with invocations",
    accent: "#a53d15",
  },
  {
    slug: "kala-bhairava-ashtakam",
    filename: "kala-bhairava-ashtakam-four-languages.pdf",
    title: "Kala Bhairava Ashtakam",
    alias: "Hymn to the guardian of Kashi",
    count: "8 verses and concluding verse",
    accent: "#4b405d",
  },
];

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

function downloadEdition(slug, script) {
  return execFileSync(
    "curl",
    [
      "-L",
      "--fail",
      "--silent",
      "--show-error",
      `${sourceRoot}/${slug}?script=${script}`,
    ],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  );
}

function decode(value) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replace(/\s*\[[^\]]+\]\s*$/u, "")
    .trim();
}

function extractLines(html, document, script) {
  const match = html.match(/<div class="stotram-content[^>]*>([\s\S]*?)<\/div>/);
  if (!match) throw new Error(`Unable to extract ${document.slug} in ${script}.`);
  let body = match[1];
  if (document.useAlternativeSection) {
    const divider = body.indexOf("<hr>");
    if (divider < 0) throw new Error("Bilvashtakam alternative section was not found.");
    body = body.slice(divider + 4);
  }
  let lines = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(([, value]) =>
    decode(value),
  );
  if (document.useAlternativeSection) {
    lines = lines.filter((line, index) => index !== 0);
  }
  if (lines.length < 9) {
    throw new Error(`${document.slug}/${script} returned only ${lines.length} lines.`);
  }
  return lines;
}

function isHeading(line) {
  return /^(?:dohā|dhyānam|caupāī|దోహా|ధ్యానమ్|చౌపాఈ|தோஹா|த்யாநம்|சௌபாஈ|ದೋಹಾ|ಧ್ಯಾನಮ್|ಚೌಪಾಈ)$/iu.test(
    line,
  );
}

function endsStanza(line) {
  return /(?:\|\||॥)\s*(?:\d+\s*)?(?:\|\||॥)?\s*$/u.test(line);
}

function groupStanzas(lines) {
  const groups = [];
  let current = [];
  for (const line of lines) {
    if (isHeading(line)) {
      if (current.length) groups.push({ kind: "verse", lines: current });
      current = [];
      groups.push({ kind: "heading", lines: [line] });
      continue;
    }
    current.push(line);
    if (endsStanza(line)) {
      groups.push({ kind: "verse", lines: current });
      current = [];
    }
  }
  if (current.length) groups.push({ kind: "verse", lines: current });
  return groups;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", "<br>");
}

function buildSection(document, edition) {
  const groups = groupStanzas(
    extractLines(downloadEdition(document.slug, edition.key), document, edition.key),
  );
  const content = groups
    .map(({ kind, lines }) => {
      if (kind === "heading") {
        return `<h3>${escapeHtml(lines[0])}</h3>`;
      }
      return `<div class="verse">${lines
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("")}</div>`;
    })
    .join("");
  return `<section class="language" style="--body-font: ${edition.font}; --accent: ${document.accent}">
    <header class="section-header">
      <span class="language-tab">${edition.tab}</span>
      <h2>${edition.heading}</h2>
      <p>${document.count} - traditional devotional hymn</p>
    </header>
    <main>${content}</main>
  </section>`;
}

function buildHtml(document) {
  const sections = editions.map((edition) => buildSection(document, edition)).join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${document.title}</title>
<style>
  @page { size: A4; margin: 17mm 15mm 18mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #241b0d; background: #fffdf7; font-family: Arial, sans-serif; }
  .cover { --accent: ${document.accent}; height: 245mm; display: flex; flex-direction: column; justify-content: center; text-align: center; page-break-after: always; padding: 20mm; border: 2px solid var(--accent); background: linear-gradient(145deg, #fffaf0, #f3e1b7); }
  .om { color: var(--accent); font-size: 50pt; line-height: 1; margin-bottom: 15mm; }
  h1 { margin: 0; color: #402707; font-family: Georgia, serif; font-size: 31pt; line-height: 1.18; }
  .cover .alias { margin: 7mm 0 0; color: var(--accent); font-size: 15pt; line-height: 1.4; }
  .rule { width: 52mm; height: 2px; background: var(--accent); margin: 13mm auto; }
  .languages { font-size: 13pt; line-height: 1.8; font-weight: 700; }
  .note { margin-top: auto; color: #6f6045; font-size: 9pt; line-height: 1.5; }
  .language { font-family: var(--body-font); page-break-before: always; }
  .section-header { border-bottom: 2px solid var(--accent); padding-bottom: 6mm; margin-bottom: 8mm; }
  .language-tab { display: inline-block; background: #3b2709; color: #f7ca5c; border-radius: 12px; padding: 3mm 6mm; font-family: Arial, sans-serif; font-size: 10pt; font-weight: 800; letter-spacing: .8px; }
  h2 { color: #442b07; font-size: 24pt; margin: 5mm 0 1.5mm; line-height: 1.25; }
  .section-header p { color: #7b6848; font-family: Arial, sans-serif; font-size: 9.5pt; margin: 0; }
  h3 { page-break-after: avoid; color: var(--accent); font-size: 14pt; margin: 8mm 0 4mm; padding-bottom: 2mm; border-bottom: 1px solid #dfc995; }
  .verse { page-break-inside: avoid; margin: 0 0 6mm; padding: 0 0 4mm 5mm; border-left: 2px solid var(--accent); }
  .verse p { margin: 0 0 2.1mm; font-size: 12.2pt; line-height: 1.55; }
</style></head><body>
  <section class="cover">
    <div class="om">ॐ</div><h1>${document.title}</h1>
    <p class="alias">${document.alias}</p><div class="rule"></div>
    <p class="languages">English - తెలుగు - தமிழ் - ಕನ್ನಡ</p>
    <p class="note">Prepared for offline devotional reading in Ayyappa Seva.<br>${document.count} presented in four reading scripts.</p>
  </section>${sections}
</body></html>`;
}

mkdirSync(tempDirectory, { recursive: true });
mkdirSync(outputDirectory, { recursive: true });
mkdirSync(assetDirectory, { recursive: true });

for (const document of documents) {
  const htmlPath = resolve(tempDirectory, `${document.slug}.html`);
  const pdfPath = resolve(outputDirectory, document.filename);
  const assetPath = resolve(assetDirectory, document.filename);
  writeFileSync(htmlPath, buildHtml(document), "utf8");
  rmSync(pdfPath, { force: true });
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: "inherit" },
  );
  const size = readFileSync(pdfPath).length;
  if (size < 20_000) throw new Error(`${document.title} PDF is unexpectedly small.`);
  copyFileSync(pdfPath, assetPath);
  console.log(`${document.title}: ${Math.round(size / 1024)} KB`);
}
