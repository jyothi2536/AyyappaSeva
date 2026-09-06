const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const read = (name) => readFileSync(path.join(__dirname, "..", name), "utf8");
const app = JSON.parse(read("app.json")).expo;
const gradle = read("android/app/build.gradle");
const manifest = read("android/app/src/main/AndroidManifest.xml");
const blocked = ["READ_EXTERNAL_STORAGE", "READ_MEDIA_AUDIO", "READ_MEDIA_IMAGES", "READ_MEDIA_VIDEO", "READ_MEDIA_VISUAL_USER_SELECTED", "RECORD_AUDIO", "SYSTEM_ALERT_WINDOW"];

test("Android release identity and versions agree with the app config", () => {
  assert.equal(gradle.match(/applicationId '([^']+)'/)[1], app.android.package);
  assert.equal(Number(gradle.match(/versionCode (\d+)/)[1]), app.android.versionCode);
  assert.equal(gradle.match(/versionName "([^"]+)"/)[1], app.version);
});
test("release signing uses the private upload key with no debug fallback", () => {
  assert.match(gradle, /signingConfig signingConfigs\.release/);
  assert.match(gradle, /task\.name == "validateSigningRelease"/);
  assert.match(gradle, /if \(releaseKeystore == null\)/);
  assert.doesNotMatch(gradle, /release \{\s*(?:\/\/[^\n]*\n\s*)*signingConfig signingConfigs\.debug/);
});
test("broad media, recording and overlay permissions are blocked in native and Expo configs", () => {
  for (const permission of blocked) {
    const fullName = `android.permission.${permission}`;
    assert.ok(app.android.blockedPermissions.includes(fullName));
    assert.ok(!app.android.permissions.includes(fullName));
    assert.match(manifest, new RegExp(`android:name="${fullName}" tools:node="remove"`));
  }
  const mediaPlugin = app.plugins.find((entry) => Array.isArray(entry) && entry[0] === "expo-media-library");
  assert.deepEqual(mediaPlugin[1].granularPermissions, []);
});
test("legacy write permission is limited to Android 12L and below", () => {
  assert.match(manifest, /android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32"/);
});
