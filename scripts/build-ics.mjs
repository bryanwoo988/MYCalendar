// Builds one subscribable calendar feed per state: ics/<STATE>.ics
// Run after changing holiday data: node scripts/build-ics.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { STATES, OFFICIAL_YEARS } from "../js/data.js";
import { buildICS } from "../js/ics.js";
import { setLang } from "../js/i18n.js";

const first = Math.min(...OFFICIAL_YEARS);
const years = Array.from({ length: 5 }, (_, i) => first + i); // official years + estimates after them
// English feeds stay at ics/<STATE>.ics (existing subscriptions); others in ics/<lang>/.
let n = 0;
for (const lang of ["en", "ms", "zh"]) {
  setLang(lang);
  const dir = lang === "en" ? "../ics/" : `../ics/${lang}/`;
  mkdirSync(new URL(dir, import.meta.url), { recursive: true });
  for (const state of Object.keys(STATES)) {
    const ics = buildICS({ state, years, now: new Date(Date.UTC(first, 0, 1)) }); // fixed stamp: stable output
    writeFileSync(new URL(`${dir}${state}.ics`, import.meta.url), ics);
    n++;
  }
}
console.log(`Wrote ${n} feeds (en, ms, zh) for ${years.join(", ")}`);
