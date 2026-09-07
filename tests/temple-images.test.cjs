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

test("Home, welcome and wallpaper use distinct temple images", () => {
  assert.equal(content.homeTempleImage, "../../assets/temple/ayyappa4.jpg");
  assert.equal(content.welcomeTempleImage, "../../assets/temple/atlanta-ayyappa-welcome-floral.jpg");
  assert.notEqual(content.welcomeTempleImage, content.homeTempleImage);
  assert.notEqual(content.welcomeTempleImage, content.wallpapers[0].source);
  assert.equal(content.wallpapers[0].id, "ayyappa");
  assert.equal(content.wallpapers[0].source, "../../assets/temple/ayyappa7.jpg");
  assert.equal(content.wallpapers[0].subtitle, "Atlanta Ayyappa Temple");
});

test("the door reveal uses its dedicated floral photo rather than the wallpaper", () => {
  const welcome = readFileSync(path.join(__dirname, "../src/screens/OnboardingScreen.tsx"), "utf8");
  assert.match(welcome, /source=\{welcomeTempleImage\}/);
  assert.doesNotMatch(welcome, /source=\{wallpapers\[0\]\.source\}/);
});

test("the other six deity wallpapers stay unchanged", () => {
  const ids = ["ganesha", "murugan", "shiva", "durga", "venkateswara", "hanuman"];
  assert.deepEqual(Array.from(content.wallpapers.slice(1), (item) => item.id), ids);
  for (const wallpaper of content.wallpapers.slice(1)) {
    assert.equal(wallpaper.source, `../../assets/wallpapers/${wallpaper.id}.png`);
  }
});
