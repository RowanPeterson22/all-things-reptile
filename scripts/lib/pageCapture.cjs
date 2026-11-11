// ─── Capture harness for the JSX species pages (one-time move) ────
// Loads a species page (or a shared species component) with Babel, swapping
// every shared component it imports for a stub and the theme for a proxy that
// returns token names ("T.card"), then calls it to get the raw element tree
// React would render. Nothing is retyped: strings come out exactly as React
// sees them (Babel applies the JSX whitespace rules).
//
// Used by scripts/extract-species-content.mjs only. Not part of the app.

const fs = require("fs");
const path = require("path");
const Module = require("module");
const babel = require("@babel/core");

const ROOT = path.resolve(__dirname, "..", "..");
const COMPONENTS = path.join(ROOT, "src", "components");
const realReact = require(path.join(ROOT, "node_modules/react"));

const T = new Proxy({}, { get: (_, k) => (typeof k === "string" ? `T.${k}` : undefined) });
const SIZE = new Proxy({}, { get: (_, k) => (typeof k === "string" ? `SIZE.${k}` : undefined) });
const FOOD_CARD = Object.freeze({ __foodCard: true });

const stub = (name) => { const f = () => null; f.stubName = name; return f; };
// What each shared component module exports, as stubs.
const STUBS = {
  SectionLabel: () => ({ default: stub("SectionLabel") }),
  WarnBox: () => ({ default: stub("WarnBox") }),
  BaskingBanner: () => ({ default: stub("BaskingBanner") }),
  ShopBtn: () => ({ default: stub("ShopBtn") }),
  TempBar: () => ({ default: stub("TempBar"), TempCard: stub("TempCard") }),
  FoodItem: () => ({ default: stub("FoodItem"), FOOD_CARD }),
  HealthItem: () => ({ default: stub("HealthItem") }),
  StatGrid: () => ({ default: stub("StatGrid") }),
  LegalTab: () => ({ default: stub("LegalTab") }),
  SpeciesPage: () => ({ default: stub("SpeciesPage") }),
  SnakeShedding: () => ({ default: stub("SnakeShedding") }),
  SnakeHandling: () => ({ default: stub("SnakeHandling") }),
  SnakeBreeding: () => ({ default: stub("SnakeBreeding") }),
};

// useState override, so a page with local state (the Bearded Dragon's age
// toggle) can be captured in each state: Map(initial value → value to use).
let stateOverride = null;
const fakeReact = { ...realReact, useState: (init) => [stateOverride && stateOverride.has(init) ? stateOverride.get(init) : init, () => {}] };

const compile = (file) => babel.transformSync(fs.readFileSync(file, "utf8"), {
  filename: file, babelrc: false, configFile: false,
  presets: [[require.resolve("@babel/preset-react"), { runtime: "automatic" }]],
  plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
}).code;

const load = (file) => {
  const m = new Module(file, module);
  m.filename = file;
  m.paths = Module._nodeModulePaths(path.dirname(file));
  m.require = (req) => {
    if (req === "react") return { __esModule: true, default: fakeReact, ...fakeReact };
    if (/constants\/theme$/.test(req)) return { __esModule: true, T, SIZE };
    if (req.startsWith(".")) {
      const resolved = path.resolve(path.dirname(file), req);
      if (path.dirname(resolved) === COMPONENTS) {
        const name = path.basename(resolved);
        if (!STUBS[name]) throw new Error(`${path.basename(file)}: no stub for component ${name}`);
        return { __esModule: true, ...STUBS[name]() };
      }
    }
    return Module.prototype.require.call(m, req);
  };
  m._compile(compile(file), file);
  return m.exports.default;
};

// A species page: its SpeciesPage props and each tab's element tree.
const capturePage = (file, overrides) => {
  const Page = load(file);
  stateOverride = overrides || null;
  try {
    const el = Page({ onBack: () => {} });
    if (!el || !el.type || el.type.stubName !== "SpeciesPage") throw new Error(`${path.basename(file)}: page doesn't render SpeciesPage`);
    const { tabContent } = el.props;
    const tabs = el.props.tabs.map(key => ({ key, tree: tabContent(key) }));
    return { props: el.props, tabs };
  } finally {
    stateOverride = null;
  }
};

// A shared component (SnakeShedding, SnakeHandling, SnakeBreeding) called
// with the given props: its element tree.
const captureComponent = (name, props = {}) => load(path.join(COMPONENTS, `${name}.jsx`))(props);

module.exports = { capturePage, captureComponent, FOOD_CARD, Fragment: realReact.Fragment, ROOT };
