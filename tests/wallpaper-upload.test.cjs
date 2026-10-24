const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const filename = path.join(__dirname, "../src/services/wallpaperUpload.ts");
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: filename,
});

function setup() {
  const resizes = [];
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: (name) => ({
      "expo-image-picker": {},
      "expo-image-manipulator": {
        SaveFormat: { JPEG: "jpeg" },
        manipulateAsync: async (uri, actions, options) => {
          const width = actions[0].resize.width;
          resizes.push({ width, format: options.format });
          return { uri: `${uri}#${width}`, width, height: Math.round(width * 4 / 3) };
        },
      },
    })[name],
  }, { filename });
  return { prepare: exports.prepareWallpaper, resizes };
}

test("large portrait photos become a 1440px JPEG plus a 400px preview", async () => {
  const app = setup();
  const result = await app.prepare({ uri: "file:///p.heic", width: 3024, height: 4032 });
  assert.deepEqual(app.resizes, [{ width: 1440, format: "jpeg" }, { width: 400, format: "jpeg" }]);
  assert.equal(result.uri, "file:///p.heic#1440");
  assert.equal(result.thumbUri, "file:///p.heic#400");
  assert.equal(result.width, 1440);
});

test("small, sideways and square photos are rejected without resizing", async () => {
  for (const [width, height] of [[900, 1600], [4032, 3024], [3000, 3000]]) {
    const app = setup();
    const result = await app.prepare({ uri: "file:///x.jpg", width, height });
    assert.ok(result.rejected);
    assert.equal(app.resizes.length, 0);
  }
});
