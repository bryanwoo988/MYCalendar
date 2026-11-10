// Malaysia holiday data.
// Public holidays: the gazetted list for GAZETTED_YEARS, otherwise calculated from
// the rules (Chinese lunar, Hijri crescent visibility, Tamil calendar, fixed dates,
// replacement-day rules). Run `node tests/holidays.test.mjs` to check the rules.
//
// `states`: "ALL", or an array of state codes, or { except: [...] }.

export const STATES = {
  JHR: "Johor", KDH: "Kedah", KTN: "Kelantan", MLK: "Melaka",
  NSN: "Negeri Sembilan", PHG: "Pahang", PRK: "Perak", PLS: "Perlis",
  PNG: "Pulau Pinang", SBH: "Sabah", SWK: "Sarawak", SGR: "Selangor",
  TRG: "Terengganu", KUL: "W.P. Kuala Lumpur", LBN: "W.P. Labuan",
  PJY: "W.P. Putrajaya",
};

// Kedah, Kelantan and Terengganu use a Friday–Saturday weekend.
export const FRI_SAT = ["KDH", "KTN", "TRG"];

import { thaipusam, deepavali } from "./astro.js";
import { fromHijri, lunarMonths } from "./calendars.js";

const DAY = 864e5;
const isoUTC = (t) => new Date(t).toISOString().slice(0, 10);

// Years whose list below comes from the published (gazetted) holiday lists.
// Every other year is calculated from the rules in `ruleHolidays`.
const GAZETTED_YEARS = [2026];

const GAZETTED = [
  { date: "2026-01-01", name: "New Year's Day", states: { except: ["JHR", "KDH", "KTN", "PLS", "TRG"] } },
  { date: "2026-01-14", name: "Birthday of Yang di-Pertuan Besar of Negeri Sembilan", states: ["NSN"] },
  { date: "2026-02-01", name: "Federal Territory Day", states: ["KUL", "LBN", "PJY"] },
  { date: "2026-02-01", name: "Thaipusam", states: ["JHR", "KDH", "NSN", "PHG", "PRK", "PNG", "SGR", "KUL", "PJY"] },
  { date: "2026-02-02", name: "Federal Territory Day (replacement)", states: ["KUL", "LBN", "PJY"] },
  { date: "2026-02-02", name: "Thaipusam (replacement)", states: ["JHR", "NSN", "PHG", "PRK", "PNG", "SGR"] },
  { date: "2026-02-03", name: "Thaipusam (replacement)", states: ["KUL", "PJY"] },
  { date: "2026-02-17", name: "Chinese New Year", states: "ALL" },
  { date: "2026-02-18", name: "Chinese New Year (2nd day)", states: { except: ["KTN", "TRG"] } },
  { date: "2026-03-07", name: "Nuzul Al-Quran", states: { except: ["JHR", "KDH", "MLK", "NSN", "SBH", "SWK"] } },
  { date: "2026-03-08", name: "Nuzul Al-Quran (replacement)", states: ["KTN", "TRG"] },
  { date: "2026-03-21", name: "Hari Raya Aidilfitri", states: "ALL" },
  { date: "2026-03-22", name: "Hari Raya Aidilfitri (2nd day)", states: "ALL" },
  { date: "2026-03-23", name: "Hari Raya Aidilfitri (replacement)", states: "ALL" },
  { date: "2026-04-03", name: "Good Friday", states: ["SBH", "SWK"] },
  { date: "2026-04-15", name: "Melaka Historical City Day", states: ["MLK"] },
  { date: "2026-05-01", name: "Labour Day", states: "ALL" },
  { date: "2026-05-27", name: "Hari Raya Haji", states: "ALL" },
  { date: "2026-05-28", name: "Hari Raya Haji (2nd day)", states: ["KDH", "KTN", "PLS", "TRG"] },
  { date: "2026-05-30", name: "Pesta Kaamatan", states: ["SBH", "LBN"] },
  { date: "2026-05-31", name: "Pesta Kaamatan (2nd day)", states: ["SBH", "LBN"] },
  { date: "2026-05-31", name: "Wesak Day", states: "ALL" },
  { date: "2026-06-01", name: "Birthday of Yang di-Pertuan Agong", states: "ALL" },
  { date: "2026-06-01", name: "Hari Gawai Dayak", states: ["SWK"] },
  { date: "2026-06-02", name: "Hari Gawai Dayak (2nd day)", states: ["SWK"] },
  { date: "2026-06-02", name: "Wesak Day (replacement)", states: { except: [...FRI_SAT, "SWK"] } },
  { date: "2026-06-03", name: "Wesak Day (replacement)", states: ["SWK"] },
  { date: "2026-06-04", name: "Hari Gawai Dayak (replacement)", states: ["SWK"] },
  { date: "2026-06-17", name: "Awal Muharram", states: "ALL" },
  { date: "2026-06-21", name: "Birthday of Sultan of Kedah", states: ["KDH"] },
  { date: "2026-07-07", name: "George Town World Heritage City Day", states: ["PNG"] },
  { date: "2026-07-22", name: "Sarawak Day", states: ["SWK"] },
  { date: "2026-08-25", name: "Maulidur Rasul", states: "ALL" },
  { date: "2026-08-31", name: "National Day (Hari Merdeka)", states: "ALL" },
  { date: "2026-09-16", name: "Malaysia Day", states: "ALL" },
  { date: "2026-11-08", name: "Deepavali", states: { except: ["SWK"] } },
  { date: "2026-11-09", name: "Deepavali (replacement)", states: { except: ["SWK", ...FRI_SAT] } },
  { date: "2026-12-11", name: "Birthday of Sultan of Selangor", states: ["SGR"] },
  { date: "2026-12-24", name: "Christmas Eve", states: ["SBH"] },
  { date: "2026-12-25", name: "Christmas Day", states: "ALL" },
];

// Gregorian Easter (anonymous Gregorian algorithm).
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return Date.UTC(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
}
const nthWeekday = (y, month, weekday, n) => {
  const first = new Date(Date.UTC(y, month, 1)).getUTCDay();
  return Date.UTC(y, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
};

// Chinese New Year (正月初一) and Wesak (15th day of the 4th lunation, counting leap
// months — matched Malaysian Wesak dates 2010–2026, 17/17).
function chineseDates(y) {
  const months = lunarMonths(y);
  const i = months.findIndex((m) => m.month === "正月" && new Date(m.start).getUTCFullYear() === y);
  return { newYear: months[i].start, wesak: months[i + 3].start + 14 * DAY };
}

function ruleHolidays(y) {
  const list = [];
  const add = (t, name, states, estimated = false) => t != null && list.push({ date: isoUTC(t), name, states, estimated });
  const fixed = (m, d) => Date.UTC(y, m - 1, d);
  const hij = (month, day, name, states) => {
    const h = fromHijri(y, month, day);
    if (h) list.push({ date: isoUTC(h.t), name, states, estimated: true, uncertain: h.uncertain });
  };
  const cn = chineseDates(y);

  add(fixed(1, 1), "New Year's Day", { except: ["JHR", "KDH", "KTN", "PLS", "TRG"] });
  add(fixed(1, 14), "Birthday of Yang di-Pertuan Besar of Negeri Sembilan", ["NSN"]);
  add(fixed(2, 1), "Federal Territory Day", ["KUL", "LBN", "PJY"]);
  add(thaipusam(y), "Thaipusam", ["JHR", "KDH", "NSN", "PHG", "PRK", "PNG", "SGR", "KUL", "PJY"], true);
  add(cn.newYear, "Chinese New Year", "ALL");
  add(cn.newYear + DAY, "Chinese New Year (2nd day)", { except: ["KTN", "TRG"] });
  hij(9, 17, "Nuzul Al-Quran", { except: ["JHR", "KDH", "MLK", "NSN", "SBH", "SWK"] });
  hij(10, 1, "Hari Raya Aidilfitri", "ALL");
  hij(10, 2, "Hari Raya Aidilfitri (2nd day)", "ALL");
  add(easter(y) - 2 * DAY, "Good Friday", ["SBH", "SWK"]);
  add(fixed(4, 15), "Melaka Historical City Day", ["MLK"]);
  add(fixed(5, 1), "Labour Day", "ALL");
  hij(12, 10, "Hari Raya Haji", "ALL");
  hij(12, 11, "Hari Raya Haji (2nd day)", ["KDH", "KTN", "PLS", "TRG"]);
  add(fixed(5, 30), "Pesta Kaamatan", ["SBH", "LBN"]);
  add(fixed(5, 31), "Pesta Kaamatan (2nd day)", ["SBH", "LBN"]);
  add(cn.wesak, "Wesak Day", "ALL", true);
  add(nthWeekday(y, 5, 1, 1), "Birthday of Yang di-Pertuan Agong", "ALL");
  add(fixed(6, 1), "Hari Gawai Dayak", ["SWK"]);
  add(fixed(6, 2), "Hari Gawai Dayak (2nd day)", ["SWK"]);
  hij(1, 1, "Awal Muharram", "ALL");
  add(nthWeekday(y, 5, 0, 3), "Birthday of Sultan of Kedah", ["KDH"]);
  add(fixed(7, 7), "George Town World Heritage City Day", ["PNG"]);
  add(fixed(7, 22), "Sarawak Day", ["SWK"]);
  hij(3, 12, "Maulidur Rasul", "ALL");
  add(fixed(8, 31), "National Day (Hari Merdeka)", "ALL");
  add(fixed(9, 16), "Malaysia Day", "ALL");
  add(deepavali(y), "Deepavali", { except: ["SWK"] }, true);
  add(fixed(12, 11), "Birthday of Sultan of Selangor", ["SGR"]);
  add(fixed(12, 24), "Christmas Eve", ["SBH"]);
  add(fixed(12, 25), "Christmas Day", "ALL");
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

export function appliesTo(holiday, state) {
  const s = holiday.states;
  if (s === "ALL") return true;
  if (Array.isArray(s)) return s.includes(state);
  return !s.except.includes(state);
}

// Replacement days: in Sat–Sun states a Sunday holiday moves to the next working day.
// In Fri–Sat states (Kedah, Kelantan, Terengganu) a Saturday holiday does; a Friday
// holiday is not replaced (Friday is the weekly rest day). Each clashing holiday gets its own day.
function withReplacements(list, state) {
  const fs = FRI_SAT.includes(state);
  const weekend = fs ? [5, 6] : [0, 6];
  const replaced = fs ? [6] : [0];
  const taken = new Set(list.map((h) => h.date));
  const out = [...list];
  const seen = new Set();
  for (const h of list) {
    const t = Date.parse(h.date + "T00:00Z");
    // Sarawak also replaces a holiday that lands on the same working day as another one
    // (e.g. Gawai and the Agong's birthday on 1 June 2026 → 4 June).
    const clash = state === "SWK" && seen.has(h.date) && !weekend.includes(new Date(t).getUTCDay());
    seen.add(h.date);
    if (!replaced.includes(new Date(t).getUTCDay()) && !clash) continue;
    let r = t + DAY;
    while (weekend.includes(new Date(r).getUTCDay()) || taken.has(isoUTC(r))) r += DAY;
    taken.add(isoUTC(r));
    out.push({ ...h, date: isoUTC(r), name: `${h.name.replace(/ \(2nd day\)$/, "")} (replacement)` });
  }
  return out;
}

const yearCache = new Map();
function yearMap(state, y) {
  const key = `${state}-${y}`;
  if (yearCache.has(key)) return yearCache.get(key);
  let list;
  if (GAZETTED_YEARS.includes(y)) list = GAZETTED.filter((h) => h.date.startsWith(`${y}-`) && appliesTo(h, state));
  else list = withReplacements(ruleHolidays(y).filter((h) => appliesTo(h, state)), state);
  const map = new Map();
  for (const h of list) {
    if (!map.has(h.date)) map.set(h.date, []);
    map.get(h.date).push({ ...h, provisional: !GAZETTED_YEARS.includes(y) });
  }
  yearCache.set(key, map);
  return map;
}

// Rule-based list for one state and year, ignoring the gazetted override (used by tests).
export const calculated = (state, y) => withReplacements(ruleHolidays(y).filter((h) => appliesTo(h, state)), state);

export const isGazetted = (y) => GAZETTED_YEARS.includes(y);

// Map-like accessor over every year, computed lazily.
export function holidaysFor(state) {
  const yearOf = (key) => Number(key.slice(0, 4));
  return {
    get: (key) => yearMap(state, yearOf(key)).get(key),
    has: (key) => yearMap(state, yearOf(key)).has(key),
    year: (y) => yearMap(state, y),
  };
}

// ---------- School holidays (KPM) ----------
// Group A = states with Fri–Sat weekend (Kedah, Kelantan, Terengganu); Group B = all others.
// Source: third-party summaries of KPM Surat Siaran Bil. 3 Tahun 2025. Excludes KPM festive add-on days.
export const SCHOOL_GROUP_A = ["KDH", "KTN", "TRG"];
export const SCHOOL_HOLIDAYS = [
  { start: "2026-01-01", end: "2026-01-10", name: "Year-end holiday 2025 (ends)", group: "A" },
  { start: "2026-01-01", end: "2026-01-11", name: "Year-end holiday 2025 (ends)", group: "B" },
  { start: "2026-03-20", end: "2026-03-28", name: "Term 1 break", group: "A" },
  { start: "2026-03-21", end: "2026-03-29", name: "Term 1 break", group: "B" },
  { start: "2026-05-22", end: "2026-06-06", name: "Mid-year holiday", group: "A" },
  { start: "2026-05-23", end: "2026-06-07", name: "Mid-year holiday", group: "B" },
  { start: "2026-08-28", end: "2026-09-05", name: "Term 2 break", group: "A" },
  { start: "2026-08-29", end: "2026-09-06", name: "Term 2 break", group: "B" },
  { start: "2026-12-04", end: "2026-12-31", name: "Year-end holiday", group: "A" },
  { start: "2026-12-05", end: "2026-12-31", name: "Year-end holiday", group: "B" },
  // 2027 — summaries of the KPM 2027 academic calendar; all schools open Mon 4 Jan 2027.
  { start: "2027-01-01", end: "2027-01-03", name: "Year-end holiday 2026 (ends)", group: "A" },
  { start: "2027-01-01", end: "2027-01-03", name: "Year-end holiday 2026 (ends)", group: "B" },
  { start: "2027-03-05", end: "2027-03-13", name: "Term 1 break", group: "A" },
  { start: "2027-03-06", end: "2027-03-14", name: "Term 1 break", group: "B" },
  { start: "2027-05-21", end: "2027-06-05", name: "Mid-year holiday", group: "A" },
  { start: "2027-05-22", end: "2027-06-06", name: "Mid-year holiday", group: "B" },
  { start: "2027-08-27", end: "2027-09-04", name: "Term 2 break", group: "A" },
  { start: "2027-08-28", end: "2027-09-05", name: "Term 2 break", group: "B" },
  { start: "2027-12-03", end: "2027-12-31", name: "Year-end holiday", group: "A" },
  { start: "2027-12-04", end: "2027-12-31", name: "Year-end holiday", group: "B" },
];

export function schoolGroup(state) {
  return SCHOOL_GROUP_A.includes(state) ? "A" : "B";
}

// ---------- Civil servant pay dates (JANM) ----------
// Source: third-party summaries of SPANM Bil. 5 Tahun 2025, with the Feb/Mar/Apr
// dates brought forward per JANM's later notices.
export const SALARY_DATES = [
  "2026-01-22", "2026-02-12", "2026-03-13", "2026-04-16", "2026-05-21", "2026-06-25",
  "2026-07-23", "2026-08-24", "2026-09-24", "2026-10-22", "2026-11-25", "2026-12-21",
  // 2027 — SPANM Bil. 5 Tahun 2026 (21 Sep 2026), per secondary summaries.
  "2027-01-25", "2027-02-25", "2027-03-25", "2027-04-22", "2027-05-12", "2027-06-17",
  "2027-07-21", "2027-08-25", "2027-09-23", "2027-10-21", "2027-11-25", "2027-12-20",
];
