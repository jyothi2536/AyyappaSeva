const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Test the production TypeScript helper without requiring a native RN runtime.
const filename = path.join(__dirname, "../src/services/maps.ts");
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: filename,
});
const destination = {
  name: "Atlanta Ayyappa Temple & దేవాలయం",
  address: "5910 Bethelview Road\nCumming, GA 30040",
  latitude: 34.1655324,
  longitude: -84.1786668,
};
const copy = {
  openMap: "Open map",
  cancel: "Cancel",
  mapErrorTitle: "Unable to open maps",
  mapErrorMessage: "Please try again or search for this address in your maps app.",
};
const coordinates = `${destination.latitude},${destination.longitude}`;

function setup(os, fails = false) {
  const urls = [];
  const alerts = [];
  const exports = {};
  const native = {
    Platform: { OS: os },
    Alert: { alert: (...args) => alerts.push(args) },
    Linking: {
      openURL: async (url) => {
        urls.push(url);
        if (fails) throw new Error("No URL handler");
      },
    },
  };
  vm.runInNewContext(outputText, {
    exports,
    require: (name) => {
      assert.equal(name, "react-native");
      return native;
    },
  }, { filename });
  return { ...exports, urls, alerts };
}

for (const action of ["place", "directions"]) {
  test(`iOS offers Apple Maps, Google Maps and Cancel for ${action}`, () => {
    const app = setup("ios");
    app.openDestinationMap(destination, action, copy);
    const [title, message, buttons] = app.alerts[0];
    assert.equal(title, copy.openMap);
    assert.equal(message, destination.name);
    assert.deepEqual(Array.from(buttons, (button) => button.text), [
      "Apple Maps", "Google Maps", "Cancel",
    ]);
    assert.equal(buttons[2].style, "cancel");
    buttons[2].onPress?.();
    assert.equal(app.urls.length, 0, "Opening or cancelling the chooser launches nothing");
  });

  for (const [index, provider] of [[0, "apple"], [1, "google"]]) {
    test(`iOS opens the selected ${provider} provider for ${action}`, () => {
      const app = setup("ios");
      app.openDestinationMap(destination, action, copy);
      app.alerts[0][2][index].onPress();
      assert.equal(app.urls.length, 1);
      const url = new URL(app.urls[0]);
      assert.equal(url.protocol, "https:");
      assert.equal(url.hostname, provider === "apple" ? "maps.apple.com" : "www.google.com");
      if (provider === "apple") {
        assert.equal(url.searchParams.get(action === "place" ? "ll" : "daddr"), coordinates);
        if (action === "place") assert.equal(url.searchParams.get("q"), destination.name);
        else assert.equal(url.searchParams.get("dirflg"), "d");
        assert.equal(url.searchParams.has("saddr"), false);
      } else {
        assert.equal(url.searchParams.get("api"), "1");
        assert.equal(url.searchParams.get(action === "place" ? "query" : "destination"), coordinates);
        assert.equal(url.pathname, action === "place" ? "/maps/search/" : "/maps/dir/");
        if (action === "directions") assert.equal(url.searchParams.get("travelmode"), "driving");
        assert.equal(url.searchParams.has("origin"), false);
      }
    });
  }

  test(`Android retains direct Google Maps access for ${action}`, () => {
    const app = setup("android");
    app.openDestinationMap(destination, action, copy);
    assert.equal(app.alerts.length, 0);
    assert.equal(app.urls.length, 1);
    assert.equal(app.urls[0], app.getMapUrl("google", destination, action));
  });
}

for (const os of ["ios", "android"]) {
  test(`${os} handles a failed map launch and shows the destination address`, async () => {
    const app = setup(os, true);
    app.openDestinationMap(destination, "directions", copy);
    if (os === "ios") app.alerts[0][2][0].onPress();
    await new Promise(setImmediate);
    const [title, message] = app.alerts.at(-1);
    assert.equal(title, copy.mapErrorTitle);
    assert.ok(message.includes(copy.mapErrorMessage));
    assert.ok(message.includes(destination.address));
    assert.equal(app.urls.length, 1, "A failed Apple Maps launch must not silently select Google");
  });
}
