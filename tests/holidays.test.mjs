// Compares the rule-based holiday calculation with the gazetted 2026 list, per state.
// Run: node tests/holidays.test.mjs
import { STATES, calculated, holidaysFor } from "../js/data.js";

// Differences we know about and can't settle from official sources yet.
const OPEN = new Set(["SBH 2026-06-03", "LBN 2026-06-03"]); // Kaamatan + Wesak both on Sunday 31 May

let mismatches = 0;
for (const state of Object.keys(STATES)) {
  const official = holidaysFor(state).year(2026);
  const calc = new Map();
  for (const h of calculated(state, 2026)) calc.set(h.date, [...(calc.get(h.date) || []), h.name]);
  const dates = new Set([...official.keys(), ...calc.keys()]);
  for (const d of [...dates].sort()) {
    const a = (official.get(d) || []).length, b = (calc.get(d) || []).length;
    if (a !== b && OPEN.has(`${state} ${d}`)) console.log(`(open question) ${state} ${d}`);
    else if (a !== b) {
      mismatches++;
      console.log(`${state} ${d}: gazetted=[${(official.get(d) || []).map((h) => h.name)}] calculated=[${calc.get(d) || []}]`);
    }
  }
}
console.log(mismatches ? `${mismatches} mismatches` : "2026: calculated list matches gazetted list for all states");
process.exitCode = mismatches ? 1 : 0;

// ---- Calculated festival dates vs. past Malaysian dates ----
import { thaipusam, deepavali } from "../js/astro.js";
import { fromHijri } from "../js/calendars.js";
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const PAST = {
  Thaipusam: { 2010: "01-30", 2011: "01-20", 2012: "02-07", 2013: "01-27", 2014: "01-17", 2015: "02-03", 2016: "01-24", 2017: "02-09", 2018: "01-31", 2019: "01-21", 2020: "02-08", 2021: "01-28", 2022: "01-18", 2023: "02-05", 2024: "01-25", 2025: "02-11", 2026: "02-01" },
  Deepavali: { 2010: "11-05", 2011: "10-26", 2012: "11-13", 2013: "11-02", 2014: "10-22", 2015: "11-10", 2016: "10-29", 2017: "10-18", 2018: "11-06", 2019: "10-27", 2020: "11-14", 2021: "11-04", 2022: "10-24", 2023: "11-12", 2024: "10-31", 2025: "10-20", 2026: "11-08" },
  "Wesak Day": { 2010: "05-28", 2011: "05-17", 2012: "05-05", 2013: "05-24", 2014: "05-13", 2015: "06-01", 2016: "05-21", 2017: "05-10", 2018: "05-29", 2019: "05-19", 2020: "05-07", 2021: "05-26", 2022: "05-15", 2023: "05-04", 2024: "05-22", 2025: "05-12", 2026: "05-31" },
  "Chinese New Year": { 2020: "01-25", 2021: "02-12", 2022: "02-01", 2023: "01-22", 2024: "02-10", 2025: "01-29", 2026: "02-17", 2027: "02-06", 2028: "01-26", 2029: "02-13", 2030: "02-03", 2031: "01-23", 2032: "02-11", 2033: "01-31", 2034: "02-19", 2035: "02-08" },
};
const ISLAMIC = { // [hijri month, day]: Malaysian dates
  "10-1": ["2023-04-22", "2024-04-10", "2025-03-31", "2026-03-21", "2022-05-02"],
  "12-10": ["2022-07-10", "2023-06-29", "2024-06-17", "2025-06-07", "2026-05-27"],
  "1-1": ["2022-07-30", "2023-07-19", "2024-07-07", "2025-06-27", "2026-06-17"],
  "3-12": ["2022-10-08", "2023-09-28", "2024-09-16", "2025-09-05", "2026-08-25"],
};
let total = 0, ok = 0;
for (const [name, dates] of Object.entries(PAST)) {
  for (const [y, md] of Object.entries(dates)) {
    let got;
    if (name === "Thaipusam") got = iso(thaipusam(+y));
    else if (name === "Deepavali") got = iso(deepavali(+y));
    else got = calculated("KUL", +y).find((h) => h.name === name)?.date;
    total++;
    if (got === `${y}-${md}`) ok++; else console.log(`${name} ${y}: calculated ${got}, actual ${y}-${md}`);
  }
}
for (const [md, dates] of Object.entries(ISLAMIC)) {
  const [m, d] = md.split("-").map(Number);
  for (const date of dates) {
    const got = fromHijri(+date.slice(0, 4), m, d);
    total++;
    if (got && iso(got.t) === date) ok++; else console.log(`Hijri ${md} ${date.slice(0, 4)}: calculated ${got && iso(got.t)}, actual ${date}`);
  }
}
console.log(`Past festival dates: ${ok}/${total} match`);
if (ok !== total) process.exitCode = 1;
