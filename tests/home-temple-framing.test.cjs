const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const filename = path.join(__dirname, "../src/components/homeTempleFraming.ts");
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: filename,
});
const framing = {};
vm.runInNewContext(outputText, { exports: framing }, { filename });

for (const width of [280, 318, 369, 390, 440, 560, 678]) {
  test(`Home photo at ${width}px: proportional, bounded and centered on the deity`, () => {
    const { viewportHeight, image } = framing.getHomeTempleFraming(width);
    const photo = framing.HOME_TEMPLE_PHOTO;
    assert.ok(Math.abs(image.width / image.height - photo.width / photo.height) < 1e-8);
    assert.ok(image.left <= 0 && image.left + image.width >= width - 1e-8);
    assert.ok(image.top <= 1e-8 && image.top + image.height >= viewportHeight - 1e-8);
    assert.ok(viewportHeight <= 520);
    const expectedLeft = width / 2 - image.width * photo.focalX;
    if (expectedLeft >= width - image.width && expectedLeft <= 0) {
      assert.ok(Math.abs(image.left + image.width * photo.focalX - width / 2) < 1e-8);
    } else {
      assert.ok(image.left === 0 || image.left === width - image.width);
    }
    // The crown and seated deity remain vertically in view; copy is below the photo.
    assert.ok(image.top + image.height * (30 / photo.height) > 0);
    assert.ok(image.top + image.height * (630 / photo.height) < viewportHeight);
  });
}

test("Home framing has a stable empty state before its first layout measurement", () => {
  const { viewportHeight, image } = framing.getHomeTempleFraming(0);
  assert.equal(viewportHeight, 0);
  for (const value of Object.values(image)) assert.equal(value, 0);
});
