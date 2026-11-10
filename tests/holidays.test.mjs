// Run: node tests/holidays.test.mjs
// 1. Estimation rules vs. the official 2026/2027 lists (JPM), state by state.
// 2. Calculated festival dates vs. past Malaysian dates.
// 3. Replacement-day rule (Act 369 s.3) regression cases.
import { STATES, appliesTo, estimatedHolidays, officialHolidays, holidaysFor } from "../js/data.js";
import { thaipusam, deepavali } from "../js/astro.js";
import { fromHijri } from "../js/calendars.js";

let failures = 0;
const fail = (msg) => { failures++; console.log("FAIL", msg); };
const iso = (t) => new Date(t).toISOString().slice(0, 10);

// 1 ---------------------------------------------------------------
// Known, explained differences between the estimation rules and the official lists.
const isKnown = (state, d) =>
  state === "PHG" && /-07-3[01]$/.test(d);   // Sultan of Pahang's birthday: 31 Jul (2026) vs 30 Jul (2027)
let skipped = 0;
for (const y of [2026, 2027]) {
  for (const state of Object.keys(STATES)) {
    const count = (arr) => arr.reduce((m, h) => m.set(h.date, (m.get(h.date) || 0) + 1), new Map());
    const a = count(officialHolidays(y).filter((h) => appliesTo(h, state)));
    const b = count(estimatedHolidays(y).filter((h) => appliesTo(h, state)));
    for (const d of new Set([...a.keys(), ...b.keys()])) {
      if ((a.get(d) || 0) === (b.get(d) || 0)) continue;
      if (isKnown(state, d)) { skipped++; continue; }
      fail(`${y} ${state} ${d}: official ${a.get(d) || 0}, estimated ${b.get(d) || 0}`);
    }
  }
}
console.log(`1. Estimation rules vs official 2026/2027 lists: all 16 states checked (${skipped} known differences skipped)`);

// 2 ---------------------------------------------------------------
const PAST = {
  Thaipusam: { 2010: "01-30", 2011: "01-20", 2012: "02-07", 2013: "01-27", 2014: "01-17", 2015: "02-03", 2016: "01-24", 2017: "02-09", 2018: "01-31", 2019: "01-21", 2020: "02-08", 2021: "01-28", 2022: "01-18", 2023: "02-05", 2024: "01-25", 2025: "02-11", 2026: "02-01", 2027: "01-22" },
  Deepavali: { 2010: "11-05", 2011: "10-26", 2012: "11-13", 2013: "11-02", 2014: "10-22", 2015: "11-10", 2016: "10-29", 2017: "10-18", 2018: "11-06", 2019: "10-27", 2020: "11-14", 2021: "11-04", 2022: "10-24", 2023: "11-12", 2024: "10-31", 2025: "10-20", 2026: "11-08", 2027: "10-28" },
  "Wesak Day": { 2010: "05-28", 2011: "05-17", 2012: "05-05", 2013: "05-24", 2014: "05-13", 2015: "06-01", 2016: "05-21", 2017: "05-10", 2018: "05-29", 2019: "05-19", 2020: "05-07", 2021: "05-26", 2022: "05-15", 2023: "05-04", 2024: "05-22", 2025: "05-12", 2026: "05-31", 2027: "05-20" },
  "Chinese New Year": { 2020: "01-25", 2021: "02-12", 2022: "02-01", 2023: "01-22", 2024: "02-10", 2025: "01-29", 2026: "02-17", 2027: "02-06", 2028: "01-26", 2029: "02-13", 2030: "02-03", 2031: "01-23", 2032: "02-11", 2033: "01-31", 2034: "02-19", 2035: "02-08" },
};
const ISLAMIC = {
  "10-1": ["2022-05-02", "2023-04-22", "2024-04-10", "2025-03-31", "2026-03-21", "2027-03-10"],
  "12-10": ["2022-07-10", "2023-06-29", "2024-06-17", "2025-06-07", "2026-05-27", "2027-05-17"],
  "1-1": ["2022-07-30", "2023-07-19", "2024-07-07", "2025-06-27", "2026-06-17", "2027-06-06"],
  "3-12": ["2022-10-08", "2023-09-28", "2024-09-16", "2025-09-05", "2026-08-25", "2027-08-15"],
};
let total = 0, ok = 0;
for (const [name, dates] of Object.entries(PAST)) {
  for (const [y, md] of Object.entries(dates)) {
    const got = name === "Thaipusam" ? iso(thaipusam(+y)) : name === "Deepavali" ? iso(deepavali(+y))
      : estimatedHolidays(+y).find((h) => h.name === name)?.date;
    total++;
    if (got === `${y}-${md}`) ok++; else fail(`${name} ${y}: calculated ${got}, actual ${y}-${md}`);
  }
}
for (const [md, dates] of Object.entries(ISLAMIC)) {
  const [m, d] = md.split("-").map(Number);
  for (const date of dates) {
    const got = fromHijri(+date.slice(0, 4), m, d);
    total++;
    if (got && iso(got.t) === date) ok++; else fail(`Hijri ${md} ${date.slice(0, 4)}: calculated ${got && iso(got.t)}, actual ${date}`);
  }
}
console.log(`2. Past festival dates: ${ok}/${total} match`);

// 3 ---------------------------------------------------------------
const REPL = [
  ["KUL", "2026-02-02"], ["KUL", "2026-02-03"], ["LBN", "2026-02-02"], ["SGR", "2026-02-02"],
  ["SGR", "2026-03-23"], ["JHR", "2026-03-24"], ["MLK", "2026-03-24"], ["PLS", "2026-05-18"],
  ["KUL", "2026-06-02"], ["KUL", "2026-11-09"], ["SWK", "2026-06-03"], ["SWK", "2026-06-04"],
  ["KUL", "2027-02-08"], ["KUL", "2027-06-08"], ["KUL", "2027-08-16"],
];
for (const [state, date] of REPL) {
  if (!(holidaysFor(state).get(date) || []).some((h) => h.kind === "replacement")) fail(`replacement ${state} ${date} missing`);
}
for (const [state, date] of [["KDH", "2026-06-22"], ["TRG", "2026-04-27"], ["SBH", "2026-06-02"]]) {
  if ((holidaysFor(state).get(date) || []).some((h) => h.kind === "replacement")) fail(`unexpected automatic replacement ${state} ${date}`);
}
console.log(`3. Replacement-day cases checked (${REPL.length + 3})`);

console.log(failures ? `${failures} failure(s)` : "All checks passed");
process.exitCode = failures ? 1 : 0;
