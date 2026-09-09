const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { IOSConfig } = require("@expo/config-plugins");

const read = (name) => readFileSync(path.join(__dirname, "..", name), "utf8");
const app = JSON.parse(read("app.json")).expo;
const project = read("ios/AyyappaSeva.xcodeproj/project.pbxproj");
const plist = read("ios/AyyappaSeva/Info.plist");

test("iOS native identity and both build configurations agree with Expo", () => {
  const versions = [...project.matchAll(/MARKETING_VERSION = ([^;]+);/g)];
  const builds = [...project.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)];
  const identifiers = [...project.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g)];
  assert.equal(versions.length, 2);
  assert.equal(builds.length, 2);
  assert.equal(identifiers.length, 2);
  for (const [, version] of versions) assert.equal(version, IOSConfig.Version.getVersion(app));
  for (const [, build] of builds) assert.equal(build, app.ios.buildNumber);
  for (const [, identifier] of identifiers) assert.equal(identifier, app.ios.bundleIdentifier);
  assert.match(plist, /<key>CFBundleShortVersionString<\/key>\s*<string>\$\(MARKETING_VERSION\)<\/string>/);
  assert.match(plist, /<key>CFBundleVersion<\/key>\s*<string>\$\(CURRENT_PROJECT_VERSION\)<\/string>/);
});

test("Expo supports the iOS-only version without changing the Android version", () => {
  assert.equal(IOSConfig.Version.getVersion(app), app.ios.version);
  const gradle = read("android/app/build.gradle");
  assert.equal(gradle.match(/versionName "([^"]+)"/)[1], app.version);
  assert.equal(Number(gradle.match(/versionCode (\d+)/)[1]), app.android.versionCode);
});
