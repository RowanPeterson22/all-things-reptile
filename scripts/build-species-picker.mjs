#!/usr/bin/env node
// Regenerates src/data/speciesPicker.json (the AI ID feedback picker's slim
// index) from src/data/australianSpecies.json. Run after changing the index:
//   node scripts/build-species-picker.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { derivePickerIndex } = require("../lib/speciesPicker.js");

const src = new URL("../src/data/australianSpecies.json", import.meta.url);
const out = new URL("../src/data/speciesPicker.json", import.meta.url);
const picker = derivePickerIndex(JSON.parse(readFileSync(src, "utf8")));
writeFileSync(out, JSON.stringify(picker) + "\n");
console.log(`Wrote ${picker.length} species to src/data/speciesPicker.json`);
