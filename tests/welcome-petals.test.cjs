const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function load(relative, dependencies = {}, globals = {}) {
  const filename = path.join(__dirname, "..", relative);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    fileName: filename,
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: (name) => {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
      return dependencies[name];
    },
    ...globals,
  }, { filename });
  return exports;
}

const motion = load("src/components/petalShowerMotion.ts");

function setup({ returning = true, reduceMotion = false } = {}) {
  const animations = [];
  const groups = [];
  const timers = new Map();
  const visibility = [];
  let completions = 0;
  let timerId = 0;
  const animation = (options) => ({
    options, started: false, stopped: false,
    start(callback) { this.started = true; this.callback = callback; },
    stop() { this.stopped = true; this.callback?.({ finished: false }); },
    finish(finished = true) { this.callback?.({ finished }); },
  });
  const Animated = {
    timing(value, options) {
      const item = animation(options);
      animations.push(item);
      return item;
    },
    parallel(children) {
      const item = animation({ children });
      groups.push(item);
      return item;
    },
  };
  const { startWelcomeReveal } = load("src/components/welcomeReveal.ts", {
    "react-native": { Animated, Easing: { linear: "linear" } },
    "./petalShowerMotion": motion,
  }, {
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  const value = () => ({ current: 0, setValue(next) { this.current = next; } });
  const left = value(), right = value(), petals = value();
  const cancel = startWelcomeReveal({
    left, right, petals, width: 400, returning, reduceMotion,
    onPetalsVisible: (visible) => visibility.push(visible),
    onComplete: () => completions++,
  });
  return { animations, groups, timers, visibility, left, right, petals, cancel, completions: () => completions };
}

test("the petals start only after both doors finish, then returning users enter Home", () => {
  const run = setup();
  assert.equal(run.groups.length, 1);
  assert.equal(run.groups[0].started, true);
  assert.equal(run.animations.length, 2);
  assert.deepEqual(run.visibility, [false]);
  assert.equal(run.timers.size, 0);
  run.groups[0].finish();
  assert.deepEqual(run.visibility, [false, true]);
  const shower = run.animations[2];
  assert.equal(shower.started, true);
  assert.equal(shower.options.duration, motion.PETAL_SHOWER_DURATION);
  assert.equal(shower.options.useNativeDriver, true);
  assert.equal(shower.options.isInteraction, false);
  assert.equal(run.timers.size, 0);
  shower.finish();
  assert.deepEqual(run.visibility, [false, true, false]);
  const timer = Array.from(run.timers.values())[0];
  assert.equal(timer.delay, 150);
  timer.callback();
  assert.equal(run.completions(), 1);
});

test("a first-time visitor keeps the Next button after the one-shot flower offering", () => {
  const run = setup({ returning: false });
  run.groups[0].finish();
  run.animations[2].finish();
  assert.equal(run.timers.size, 0);
  assert.equal(run.completions(), 0);
  assert.deepEqual(run.visibility, [false, true, false]);
});

test("interrupted doors never start a petal shower", () => {
  const run = setup();
  run.groups[0].finish(false);
  assert.equal(run.animations.length, 2);
  assert.deepEqual(run.visibility, [false]);
  assert.equal(run.timers.size, 0);
});

test("leaving during the doors prevents a late callback from starting flowers", () => {
  const run = setup();
  run.cancel();
  run.groups[0].finish();
  assert.equal(run.groups[0].stopped, true);
  assert.equal(run.animations.length, 2);
  assert.equal(run.timers.size, 0);
});

test("leaving during flowers stops the animation and prevents late navigation", () => {
  const run = setup();
  run.groups[0].finish();
  run.cancel();
  run.animations[2].finish();
  assert.equal(run.animations[2].stopped, true);
  assert.equal(run.timers.size, 0);
  assert.equal(run.completions(), 0);
});

test("leaving after flowers cancels even an already queued completion callback", () => {
  const run = setup();
  run.groups[0].finish();
  run.animations[2].finish();
  const timer = Array.from(run.timers.values())[0];
  run.cancel();
  timer.callback();
  assert.equal(run.timers.size, 0);
  assert.equal(run.completions(), 0);
});

for (const returning of [true, false]) {
  test(`Reduce Motion: no moving doors or flowers (${returning ? "returning" : "new"} visitor)`, () => {
    const run = setup({ returning, reduceMotion: true });
    assert.equal(run.left.current, -212);
    assert.equal(run.right.current, 212);
    assert.equal(run.animations.length, 0);
    assert.equal(run.groups.length, 0);
    assert.deepEqual(run.visibility, [false]);
    assert.equal(run.timers.size, returning ? 1 : 0);
    if (returning) {
      const timer = Array.from(run.timers.values())[0];
      assert.equal(timer.delay, 700);
      timer.callback();
      assert.equal(run.completions(), 1);
    }
  });
}

test("petals are bounded, staggered, fade above the controls, and finish in one short offering", () => {
  assert.equal(motion.offeringPetals.length, 26);
  assert.ok(motion.PETAL_SHOWER_DURATION <= 3000);
  for (const petal of motion.offeringPetals) {
    assert.ok(petal.start >= 0 && petal.end < 1);
    assert.ok(petal.start + 0.07 < petal.end - 0.12);
    assert.ok(petal.startX > 0 && petal.startX < 1);
    assert.ok(petal.endX >= 0.3 && petal.endX <= 0.7);
    assert.ok(petal.endY < 0.75);
  }
});

test("the decorative flower layer cannot intercept taps or become a screen-reader target", () => {
  const { default: PetalShower } = load("src/components/PetalShower.tsx", {
    react: require("react"),
    "react/jsx-runtime": require("react/jsx-runtime"),
    "react-native": { Animated: { View: "AnimatedView" }, View: "View", StyleSheet: { create: (s) => s, absoluteFill: "absoluteFill" } },
    "expo-linear-gradient": { LinearGradient: "LinearGradient" },
    "./petalShowerMotion": motion,
  });
  const tree = PetalShower({ progress: { interpolate: (options) => options }, width: 400, height: 900 });
  assert.equal(tree.props.pointerEvents, "none");
  assert.equal(tree.props.accessible, false);
  assert.equal(tree.props.accessibilityElementsHidden, true);
  assert.equal(tree.props.importantForAccessibility, "no-hide-descendants");
  assert.equal(tree.props.children.length, 26);
  for (const child of tree.props.children) {
    const opacity = child.props.style[1].opacity;
    assert.equal(opacity.outputRange[0], 0);
    assert.equal(opacity.outputRange.at(-1), 0);
  }
});
