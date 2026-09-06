const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Exercise the production component and copy, with only native services mocked.
function loadSource(relativePath, resolve) {
  const filename = path.join(__dirname, "..", relativePath);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: resolve }, { filename });
  return exports;
}

const content = loadSource("src/data/content.ts", (name) => {
  assert.ok(name.startsWith("../../assets/"));
  return name;
});
const theme = loadSource("src/theme.ts", () => assert.fail("Unexpected import"));

function nodes(element) {
  if (Array.isArray(element)) return element.flatMap(nodes);
  if (!element || typeof element !== "object") return [];
  return [element, ...nodes(element.props?.children)];
}

for (const language of ["en", "te", "ta", "kn"]) {
  for (const isAdmin of [false, true]) {
    test(`${language}: no user signup; admin access and preferences remain (${isAdmin ? "admin" : "guest"})`, () => {
      const navigated = [];
      const selectedLanguages = [];
      let welcomeCount = 0;
      let logoutCount = 0;
      const state = {
        t: content.translations[language],
        language,
        isAdmin,
        // Old installations may have had this flag; it must not change the UI.
        registered: true,
        setLanguage: (value) => selectedLanguages.push(value),
        replayWelcome: () => welcomeCount++,
        leaveAdmin: () => logoutCount++,
      };
      const dependencies = {
        react: require("react"),
        "react/jsx-runtime": require("react/jsx-runtime"),
        "react-native": {
          Pressable: "Pressable", Text: "Text", View: "View",
          StyleSheet: { create: (styles) => styles },
        },
        "@react-navigation/native": {
          useNavigation: () => ({ navigate: (route) => navigated.push(route) }),
        },
        "../components/UI": { Icon: "Icon", Page: "Page", ScreenHeader: "ScreenHeader" },
        "../data/content": content,
        "../state/AppContext": { useApp: () => state },
        "../navigation/adminLogout": {
          signOutToHome: (leaveAdmin) => leaveAdmin(),
        },
        "../theme": theme,
      };
      const { default: ProfileScreen } = loadSource("src/screens/ProfileScreen.tsx", (name) => {
        assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
        return dependencies[name];
      });
      const tree = nodes(ProfileScreen());
      assert.equal(tree.find((node) => node.type === "ScreenHeader").props.title, state.t.profile);
      assert.equal(tree.some((node) => node.type === "TextInput"), false);
      assert.doesNotMatch(JSON.stringify(tree), /Join our devotee family|Registration|Register for updates/);
      assert.equal(Object.hasOwn(state.t, "register"), false);
      assert.equal(Object.hasOwn(state.t, "registered"), false);

      const buttons = tree.filter((node) => node.type === "Pressable");
      assert.equal(buttons.length, isAdmin ? 7 : 6);
      for (const button of buttons) button.props.onPress();
      assert.deepEqual(navigated, ["Admin"], "The only login route is Admin");
      assert.deepEqual(selectedLanguages, ["en", "te", "ta", "kn"]);
      assert.equal(welcomeCount, 1);
      assert.equal(logoutCount, isAdmin ? 1 : 0);
    });
  }
}

test("the removed registration form has no navigation route or persisted app state", () => {
  assert.equal(existsSync(path.join(__dirname, "../src/screens/RegistrationScreen.tsx")), false);
  for (const file of ["src/navigation/AppNavigator.tsx", "src/types.ts", "src/state/AppContext.tsx"]) {
    assert.doesNotMatch(readFileSync(path.join(__dirname, "..", file), "utf8"), /\bRegistration\b|\bregistered\b|\bregister\b/);
  }
});
