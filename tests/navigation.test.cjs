const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

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
  vm.runInNewContext(outputText, { exports, require: resolve, Error }, { filename });
  return exports;
}

function nodes(element) {
  if (Array.isArray(element)) return element.flatMap(nodes);
  if (!element || typeof element !== "object") return [];
  return [element, ...nodes(element.props?.children)];
}

async function setupNavigator() {
  const routers = await import("@react-navigation/routers");
  const actions = [];
  const selectedTabs = [];
  const navigationRef = {
    isReady: () => true,
    dispatch: (action) => actions.push(action),
    getCurrentRoute: () => ({ name: "Home" }),
  };
  const dependencies = {
    react: {
      ...require("react"),
      useState: (initial) => [initial, (tab) => selectedTabs.push(tab)],
      useCallback: (callback) => callback,
    },
    "react/jsx-runtime": require("react/jsx-runtime"),
    "react-native": { View: "View", StyleSheet: { create: (styles) => styles } },
    "@react-navigation/native": {
      createNavigationContainerRef: () => navigationRef,
      NavigationContainer: "NavigationContainer",
      DarkTheme: { colors: {} },
      StackActions: routers.StackActions,
    },
    "@react-navigation/native-stack": {
      createNativeStackNavigator: () => ({ Navigator: "Stack", Screen: "Screen", Group: "Group" }),
    },
    "@react-navigation/bottom-tabs": {
      createBottomTabNavigator: () => ({ Navigator: "Tabs", Screen: "TabScreen" }),
    },
    "../components/AppChrome": { AppHeader: "AppHeader", AppFooter: "AppFooter" },
    "../theme": { colors: {} },
  };
  const { default: AppNavigator } = loadSource("src/navigation/AppNavigator.tsx", (name) => {
    if (name.startsWith("../screens/")) return name;
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
    return dependencies[name];
  });
  const tree = nodes(AppNavigator());
  const stack = tree.find((node) => node.type === "Stack");
  const routeNames = nodes(stack).filter((node) => node.type === "Screen").map((node) => node.props.name);
  const options = { routeNames, routeParamList: {}, routeGetIdList: {} };
  const router = routers.StackRouter({ initialRouteName: "MainTabs" });
  let state = router.getInitialState(options);
  for (const route of ["Admin", "AdminCalendar", "AdminTempleEvent"]) {
    state = router.getStateForAction(state, routers.CommonActions.navigate(route), options);
  }
  return { routers, tree, stack, router, state, options, actions, selectedTabs, navigationRef };
}

test("admin screens use the shared header/footer layout, not native modals", async () => {
  const { tree, stack } = await setupNavigator();
  assert.equal(tree.filter((node) => node.type === "AppHeader").length, 1);
  assert.equal(tree.filter((node) => node.type === "AppFooter").length, 1);
  assert.equal(stack.props.screenOptions.presentation, "card");
  assert.equal(tree.some((node) => /modal|sheet/i.test(node.props?.screenOptions?.presentation ?? "")), false);
  const adminRoutes = nodes(stack).filter((node) => node.type === "Screen" && node.props.name.startsWith("Admin"));
  assert.equal(adminRoutes.length, 4);
});

for (const tab of ["Home", "Songs", "Updates", "Temple", "Profile"]) {
  test(`footer ${tab} dismisses nested admin screens without duplicating MainTabs`, async () => {
    const app = await setupNavigator();
    app.tree.find((node) => node.type === "AppFooter").props.onNavigate(tab);
    const next = app.router.getStateForAction(app.state, app.actions[0], app.options);
    assert.equal(next.routes.length, 1);
    assert.equal(next.routes[0].name, "MainTabs");
    assert.equal(next.routes[0].params.screen, tab);
    assert.deepEqual(app.selectedTabs, [tab]);
    assert.equal(app.router.getStateForAction(next, app.routers.CommonActions.goBack(), app.options), null);
  });
}

test("the header notification button also dismisses the admin stack", async () => {
  const app = await setupNavigator();
  app.tree.find((node) => node.type === "AppHeader").props.onUpdates();
  const next = app.router.getStateForAction(app.state, app.actions[0], app.options);
  assert.equal(next.routes.length, 1);
  assert.equal(next.routes[0].params.screen, "Updates");
});

test("successful logout waits for sign-out, returns Home, and removes admin back history", async () => {
  const app = await setupNavigator();
  const alerts = [];
  const { signOutToHome } = loadSource("src/navigation/adminLogout.ts", (name) => {
    assert.equal(name, "react-native");
    return { Alert: { alert: (...args) => alerts.push(args) } };
  });
  let finishSignOut;
  let resetState;
  const pending = signOutToHome(
    () => new Promise((resolve) => { finishSignOut = resolve; }),
    { reset: (state) => { resetState = state; } },
  );
  assert.equal(resetState, undefined, "Don't navigate away before sign-out succeeds");
  finishSignOut();
  await pending;
  const result = app.router.getStateForAction(app.state, app.routers.CommonActions.reset(resetState), app.options);
  const next = app.router.getRehydratedState(result, app.options);
  assert.equal(next.routes.length, 1);
  assert.equal(next.routes[0].name, "MainTabs");
  assert.equal(next.routes[0].params.screen, "Home");
  assert.equal(app.router.getStateForAction(next, app.routers.CommonActions.goBack(), app.options), null);
  assert.equal(alerts.length, 0);
});

test("failed logout keeps the current screen and reports the error", async () => {
  const alerts = [];
  const { signOutToHome } = loadSource("src/navigation/adminLogout.ts", () => ({
    Alert: { alert: (...args) => alerts.push(args) },
  }));
  await signOutToHome(
    async () => { throw new Error("Sign-out unavailable"); },
    { reset: () => assert.fail("Failed logout must not reset navigation") },
  );
  assert.deepEqual(alerts, [["Unable to sign out", "Sign-out unavailable"]]);
});
