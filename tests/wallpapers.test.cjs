const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const filename = path.join(__dirname, "../src/services/wallpapers.ts");
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: filename,
});

function setup(os, version, { granted = true, uri = "file:///wallpaper.jpg", fails = false } = {}) {
  const calls = [];
  const exports = {};
  const dependencies = {
    "react-native": { Platform: { OS: os, Version: version } },
    "expo-asset": { Asset: { fromModule: (source) => {
      calls.push(["asset", source]);
      return { localUri: uri, downloadAsync: async () => calls.push(["download"]) };
    } } },
    "expo-media-library": {
      requestPermissionsAsync: async (...args) => {
        calls.push(["permission", ...args]);
        return { granted };
      },
      saveToLibraryAsync: async (value) => {
        calls.push(["save", value]);
        if (fails) throw new Error("Storage is full");
      },
    },
  };
  vm.runInNewContext(outputText, {
    exports,
    require: (name) => {
      assert.ok(Object.hasOwn(dependencies, name));
      return dependencies[name];
    },
  }, { filename });
  return { save: exports.saveWallpaperAsset, calls };
}

for (const version of [33, 34, 36]) {
  test(`Android ${version}: saves wallpaper without gallery or microphone permission`, async () => {
    const app = setup("android", version);
    await app.save(42);
    assert.deepEqual(app.calls, [["asset", 42], ["download"], ["save", "file:///wallpaper.jpg"]]);
  });
}
for (const version of [24, 29, 32]) {
  test(`Android ${version}: asks only for legacy write access`, async () => {
    const app = setup("android", version);
    await app.save(42);
    assert.deepEqual(app.calls[0], ["permission", true]);
    assert.equal(app.calls.at(-1)[0], "save");
  });
}
test("iOS keeps its existing permission flow", async () => {
  const app = setup("ios", "26.5");
  await app.save(42);
  assert.deepEqual(app.calls[0], ["permission"]);
});
for (const [os, version] of [["android", 32], ["ios", "26.5"]]) {
  test(`${os}: denied permission does not download or save`, async () => {
    const app = setup(os, version, { granted: false });
    await assert.rejects(app.save(42), /permission is required/);
    assert.equal(app.calls.length, 1);
  });
}
test("missing downloaded file reports an error instead of saving", async () => {
  const app = setup("android", 36, { uri: null });
  await assert.rejects(app.save(42), /Unable to prepare wallpaper/);
  assert.equal(app.calls.some(([action]) => action === "save"), false);
});
test("native save failure reaches the screen's error handler", async () => {
  const app = setup("android", 36, { fails: true });
  await assert.rejects(app.save(42), /Storage is full/);
});
