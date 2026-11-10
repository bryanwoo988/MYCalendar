// Builds one subscribable calendar feed per state: ics/<STATE>.ics
// Run after changing holiday data: node scripts/build-ics.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { STATES, OFFICIAL_YEARS } from "../js/data.js";
import { buildICS } from "../js/ics.js";

const first = Math.min(...OFFICIAL_YEARS);
const years = Array.from({ length: 5 }, (_, i) => first + i); // official years + estimates after them
mkdirSync(new URL("../ics/", import.meta.url), { recursive: true });
for (const state of Object.keys(STATES)) {
  const ics = buildICS({ state, years, now: new Date(Date.UTC(first, 0, 1)) }); // fixed stamp: stable output
  writeFileSync(new URL(`../ics/${state}.ics`, import.meta.url), ics);
}
console.log(`Wrote ${Object.keys(STATES).length} feeds for ${years.join(", ")}`);
