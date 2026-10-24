const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function compile(file) {
  const src = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  return ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
}

function run(code, mocks) {
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: (m) => mocks[m], Date, Math, JSON });
  return module.exports;
}

function load() {
  const sun = run(compile("src/services/sun.ts"), {});
  return run(compile("src/services/deeksha.ts"), {
    "@react-native-async-storage/async-storage": { default: {} },
    "react-native": { Platform: { OS: "ios" } },
    "expo-notifications": {},
    "./sun": sun,
    "./location": { getSunLocation: async () => sun.TEMPLE_LOCATION },
  });
}

const sun = run(compile("src/services/sun.ts"), {});

test("temple sunrise/sunset match published Cumming, GA times", () => {
  const t = sun.sunTimes(2026, 10, 21);
  assert.equal(sun.formatTempleTime(t.sunrise), "7:46 AM");
  assert.equal(sun.formatTempleTime(t.sunset), "6:55 PM");
});

test("daily reminders: sunrise and 1h-before-sunset for each day in the window", () => {
  const d = load();
  const list = d.dailyReminders("2026-11-01", new Date(2026, 10, 1, 0, 0), 14);
  assert.equal(list.length, 28);
  assert.match(list[0].title, /Day 1 of 41/);
  assert.match(list[0].body, /Today sunrise time is \d+:\d\d AM\. Start your puja before sunrise\./);
  assert.match(list[1].body, /Today sunset time is \d+:\d\d PM\. Please start offering your evening puja\./);
  const t = sun.sunTimes(2026, 11, 1);
  assert.equal(list[1].date.getTime(), t.sunset.getTime() - 3_600_000);
  // Nothing after Day 41.
  assert.equal(d.dailyReminders("2026-11-01", new Date(2026, 11, 20)).length, 0);
});

test("sunrise/sunset follow the devotee's location", () => {
  const atl = sun.sunTimes(2026, 11, 15, 34.16, -84.2);
  const sea = sun.sunTimes(2026, 11, 15, 47.61, -122.33);
  const kochi = sun.sunTimes(2026, 11, 15, 9.93, 76.27);
  // Seattle's day is much shorter than Atlanta's in November; Kochi rises ~10.5h before Atlanta.
  assert.ok(sea.sunset - sea.sunrise < atl.sunset - atl.sunrise - 3_600_000);
  assert.ok(atl.sunrise - kochi.sunrise > 10 * 3_600_000);
});

const d = load();

test("day 1 on the start day, counts up to 41", () => {
  const p1 = d.deekshaProgress("2026-11-01", new Date(2026, 10, 1, 9));
  assert.equal(p1.status, "active");
  assert.equal(p1.day, 1);
  assert.equal(p1.daysLeft, 40);
  const p40 = d.deekshaProgress("2026-11-01", new Date(2026, 11, 10, 9));
  assert.equal(p40.day, 40);
  assert.equal(p40.irumudiTomorrow, true);
  const p41 = d.deekshaProgress("2026-11-01", new Date(2026, 11, 11, 23));
  assert.equal(p41.irumudiToday, true);
  assert.equal(d.deekshaProgress("2026-11-01", new Date(2026, 11, 12)).status, "complete");
});

test("future start is upcoming", () => {
  const p = d.deekshaProgress("2026-11-05", new Date(2026, 10, 1));
  assert.equal(p.status, "upcoming");
  assert.equal(p.daysUntilStart, 4);
});

test("reminder fires on day 40 at 8 AM", () => {
  const r = d.reminderDate("2026-11-01");
  assert.equal(r.getMonth(), 11);
  assert.equal(r.getDate(), 10);
  assert.equal(r.getHours(), 8);
});
