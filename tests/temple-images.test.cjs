const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const filename = path.join(__dirname, "../src/data/content.ts");
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: filename,
});
const content = {};
vm.runInNewContext(outputText, {
  exports: content,
  require: (asset) => {
    assert.ok(existsSync(path.resolve(path.dirname(filename), asset)), `Missing asset: ${asset}`);
    return asset;
  },
}, { filename });

test("Home and welcome use distinct temple images", () => {
  assert.equal(content.homeTempleImage, "../../assets/temple/ayyappa4.jpg");
  assert.equal(content.welcomeTempleImage, "../../assets/temple/welcome-mandalam.webp");
  assert.notEqual(content.welcomeTempleImage, content.homeTempleImage);
});

test("wallpapers come from Firebase, not bundled deity images", () => {
  assert.equal(content.wallpapers, undefined);
  for (const id of ["ganesha", "murugan", "shiva", "durga", "venkateswara", "hanuman"]) {
    assert.equal(existsSync(path.join(__dirname, `../assets/wallpapers/${id}.png`)), false);
  }
});

test("the door reveal uses its dedicated floral photo rather than the wallpaper", () => {
  const welcome = readFileSync(path.join(__dirname, "../src/screens/OnboardingScreen.tsx"), "utf8");
  assert.match(welcome, /source=\{welcomeTempleImage\}/);
  assert.doesNotMatch(welcome, /source=\{wallpapers\[0\]\.source\}/);
});
