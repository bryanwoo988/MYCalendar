// Malaysia holiday data.
//
// Public holidays
//   * OFFICIAL years: transcribed from the Prime Minister's Department list
//     "Jadual Hari Kelepasan Am Persekutuan dan Negeri" (BKPP, kabinet.gov.my).
//   * Replacement days (cuti ganti): Holidays Act 1951 (Act 369) s.3 — a holiday on the
//     weekly rest day (Sunday) moves to the next day. Applied automatically only where
//     Act 369 governs and the rest day is Sunday. Kedah, Kelantan, Terengganu (Friday
//     rest day), Sabah and Sarawak (own ordinances) appoint replacements by notice;
//     only gazetted ones are listed (see GAZETTED_REPLACEMENTS).
//   * Other years: ESTIMATED from the patterns in the official lists plus astronomy.
//
// School holidays: KPM academic calendar circulars (copies hosted on kabinet.gov.my).
//
// `states`: "ALL", "-A B C" (all except), or "A B C".

import { thaipusam, deepavali } from "./astro.js";
import { fromHijri, lunarMonths } from "./calendars.js";

export const STATES = {
  JHR: "Johor", KDH: "Kedah", KTN: "Kelantan", MLK: "Melaka",
  NSN: "Negeri Sembilan", PHG: "Pahang", PRK: "Perak", PLS: "Perlis",
  PNG: "Pulau Pinang", SBH: "Sabah", SWK: "Sarawak", SGR: "Selangor",
  TRG: "Terengganu", KUL: "W.P. Kuala Lumpur", LBN: "W.P. Labuan",
  PJY: "W.P. Putrajaya",
};
export const FRI_SAT = ["KDH", "KTN", "TRG"];
// States where Act 369 s.3 Sunday replacement is applied automatically.
const AUTO_REPLACE = ["JHR", "MLK", "NSN", "PHG", "PRK", "PLS", "PNG", "SGR", "KUL", "LBN", "PJY"];

export const SOURCES = {
  hka2026: { short: "JPM · Hari Kelepasan Am 2026", label: "JPM (BKPP): Hari Kelepasan Am Persekutuan dan Negeri 2026", url: "https://www.kabinet.gov.my/storage/2025/08/HKA-2026.pdf" },
  hka2027: { short: "JPM · Hari Kelepasan Am 2027", label: "JPM (BKPP): Hari Kelepasan Am Persekutuan dan Negeri 2027", url: "https://www.kabinet.gov.my/storage/2026/08/HKA_2027.pdf" },
  swk202: { short: "Sarawak Gazette L.N. 202/2026", label: "Sarawak Government Gazette, Swk. L.N. 202 (2026)", url: "https://lawnet.sarawak.gov.my/lawnet_file/Subsidiary/SUB_Issue%20No.%2044_L.N.%20202%20PUBLICHOLIDAY.pdf" },
  act369: { short: "Holidays Act 1951, s.3", label: "Holidays Act 1951 (Act 369), section 3", url: "https://www.kabinet.gov.my/hari-kelepasan-am/" },
  kpm2026: { short: "KPM · Kalendar Akademik 2026", label: "KPM Surat Siaran Bil. 3 Tahun 2025: Kalendar Akademik 2026", url: "https://www.kabinet.gov.my/storage/2025/10/SS-KPM-Bil.-3-2025-Kalendar-Akademik-2026-1.pdf" },
  kpm2025: { short: "KPM · Kalendar 2025/2026", label: "KPM: Kalendar Akademik Sesi 2025/2026 (Pindaan)", url: "https://www.kabinet.gov.my/storage/2025/04/tp25-pindaan.pdf" },
  moe: { short: "KPM website", label: "Kementerian Pendidikan Malaysia", url: "https://www.moe.gov.my/" },
};

const ISLAMIC_STAR = true; // marks dates the official list says are "tertakluk kepada perubahan"

// [date, name, states, subjectToChange?]
const OFFICIAL = {
  2026: { source: "hka2026", list: [
    ["2026-01-01", "New Year's Day", "-JHR KDH KTN PLS TRG"],
    ["2026-01-14", "Birthday of Yang di-Pertuan Besar Negeri Sembilan", "NSN"],
    ["2026-01-17", "Israk and Mikraj", "KDH NSN PLS TRG"],
    ["2026-02-01", "Federal Territory Day", "KUL LBN PJY"],
    ["2026-02-01", "Thaipusam", "KUL PJY JHR NSN PRK PNG SGR"],
    ["2026-02-17", "Chinese New Year", "ALL"],
    ["2026-02-18", "Chinese New Year (2nd day)", "ALL"],
    ["2026-02-19", "Awal Ramadan", "JHR KDH"],
    ["2026-02-20", "Declaration of Independence Day (Melaka)", "MLK"],
    ["2026-03-04", "Anniversary of Installation of Sultan of Terengganu", "TRG"],
    ["2026-03-07", "Nuzul Al-Quran", "KUL LBN PJY KTN PHG PRK PLS PNG SGR TRG"],
    ["2026-03-21", "Hari Raya Aidilfitri", "ALL"],
    ["2026-03-22", "Hari Raya Aidilfitri (2nd day)", "ALL"],
    ["2026-03-23", "Birthday of Sultan of Johor", "JHR"],
    ["2026-03-23", "Hari Raya Aidilfitri (3rd day)", "MLK"],
    ["2026-03-30", "Birthday of Yang di-Pertua Negeri Sabah", "SBH"],
    ["2026-04-03", "Good Friday", "SBH SWK"],
    ["2026-04-26", "Birthday of Sultan of Terengganu", "TRG"],
    ["2026-05-01", "Labour Day", "ALL"],
    ["2026-05-17", "Birthday of Raja of Perlis", "PLS"],
    ["2026-05-22", "Hol of Almarhum Sultan Ahmad Shah (Pahang)", "PHG"],
    ["2026-05-26", "Hari Arafah", "KTN TRG"],
    ["2026-05-27", "Hari Raya Haji", "ALL"],
    ["2026-05-28", "Hari Raya Haji (2nd day)", "KDH KTN PLS TRG"],
    ["2026-05-30", "Pesta Kaamatan", "LBN SBH"],
    ["2026-05-31", "Wesak Day", "ALL"],
    ["2026-05-31", "Pesta Kaamatan (2nd day)", "LBN SBH"],
    ["2026-06-01", "Birthday of Yang di-Pertuan Agong", "ALL"],
    ["2026-06-01", "Hari Gawai Dayak", "SWK"],
    ["2026-06-02", "Hari Gawai Dayak (2nd day)", "SWK"],
    ["2026-06-17", "Awal Muharram", "ALL"],
    ["2026-06-21", "Birthday of Sultan of Kedah", "KDH"],
    ["2026-07-07", "George Town World Heritage City Day", "PNG"],
    ["2026-07-11", "Birthday of Yang di-Pertua Negeri Pulau Pinang", "PNG"],
    ["2026-07-21", "Hol of Almarhum Sultan Iskandar (Johor)", "JHR"],
    ["2026-07-22", "Sarawak Independence Day", "SWK"],
    ["2026-07-31", "Birthday of Sultan of Pahang", "PHG"],
    ["2026-08-24", "Birthday of Yang di-Pertua Negeri Melaka", "MLK"],
    ["2026-08-25", "Maulidur Rasul", "ALL"],
    ["2026-08-31", "National Day (Hari Kebangsaan)", "ALL"],
    ["2026-09-16", "Malaysia Day", "ALL"],
    ["2026-09-29", "Birthday of Sultan of Kelantan", "KTN"],
    ["2026-09-30", "Birthday of Sultan of Kelantan (2nd day)", "KTN"],
    ["2026-10-10", "Birthday of Yang di-Pertua Negeri Sarawak", "SWK"],
    ["2026-11-06", "Birthday of Sultan of Perak", "PRK"],
    ["2026-11-08", "Deepavali", "-SWK"],
    ["2026-12-11", "Birthday of Sultan of Selangor", "SGR"],
    ["2026-12-24", "Christmas Eve", "SBH"],
    ["2026-12-25", "Christmas Day", "ALL"],
  ] },
  2027: { source: "hka2027", list: [
    ["2027-01-01", "New Year's Day", "-JHR KDH KTN PLS TRG"],
    ["2027-01-06", "Israk and Mikraj", "KDH NSN PLS TRG"],
    ["2027-01-14", "Birthday of Yang di-Pertuan Besar Negeri Sembilan", "NSN"],
    ["2027-01-22", "Thaipusam", "KUL PJY JHR NSN PRK PNG SGR"],
    ["2027-02-01", "Federal Territory Day", "KUL LBN PJY"],
    ["2027-02-06", "Chinese New Year", "ALL"],
    ["2027-02-07", "Chinese New Year (2nd day)", "ALL"],
    ["2027-02-08", "Awal Ramadan", "JHR KDH", ISLAMIC_STAR],
    ["2027-02-20", "Declaration of Independence Day (Melaka)", "MLK"],
    ["2027-02-24", "Nuzul Al-Quran", "KUL LBN PJY KTN PHG PRK PLS PNG SGR TRG"],
    ["2027-03-04", "Anniversary of Installation of Sultan of Terengganu", "TRG"],
    ["2027-03-10", "Hari Raya Aidilfitri", "ALL", ISLAMIC_STAR],
    ["2027-03-11", "Hari Raya Aidilfitri (2nd day)", "ALL", ISLAMIC_STAR],
    ["2027-03-12", "Hari Raya Aidilfitri (3rd day)", "MLK"],
    ["2027-03-23", "Birthday of Sultan of Johor", "JHR"],
    ["2027-03-26", "Good Friday", "SBH SWK"],
    ["2027-03-30", "Birthday of Yang di-Pertua Negeri Sabah", "SBH"],
    ["2027-04-26", "Birthday of Sultan of Terengganu", "TRG"],
    ["2027-05-01", "Labour Day", "ALL"],
    ["2027-05-16", "Hari Arafah", "KTN TRG"],
    ["2027-05-17", "Hari Raya Haji", "ALL", ISLAMIC_STAR],
    ["2027-05-17", "Birthday of Raja of Perlis", "PLS"],
    ["2027-05-18", "Hari Raya Haji (2nd day)", "KDH KTN PLS TRG", ISLAMIC_STAR],
    ["2027-05-20", "Wesak Day", "ALL"],
    ["2027-05-22", "Hol of Almarhum Sultan Ahmad Shah (Pahang)", "PHG"],
    ["2027-05-30", "Pesta Kaamatan", "LBN SBH"],
    ["2027-05-31", "Pesta Kaamatan (2nd day)", "LBN SBH"],
    ["2027-06-01", "Hari Gawai Dayak", "SWK"],
    ["2027-06-02", "Hari Gawai Dayak (2nd day)", "SWK"],
    ["2027-06-06", "Awal Muharram", "ALL"],
    ["2027-06-07", "Birthday of Yang di-Pertuan Agong", "ALL"],
    ["2027-06-20", "Birthday of Sultan of Kedah", "KDH"],
    ["2027-07-07", "George Town World Heritage City Day", "PNG"],
    ["2027-07-10", "Birthday of Yang di-Pertua Negeri Pulau Pinang", "PNG"],
    ["2027-07-11", "Hol of Almarhum Sultan Iskandar (Johor)", "JHR"],
    ["2027-07-22", "Sarawak Independence Day", "SWK"],
    ["2027-07-30", "Birthday of Sultan of Pahang", "PHG"],
    ["2027-08-15", "Maulidur Rasul", "ALL"],
    ["2027-08-24", "Birthday of Yang di-Pertua Negeri Melaka", "MLK"],
    ["2027-08-31", "National Day (Hari Kebangsaan)", "ALL"],
    ["2027-09-16", "Malaysia Day", "ALL"],
    ["2027-09-29", "Birthday of Sultan of Kelantan", "KTN"],
    ["2027-09-30", "Birthday of Sultan of Kelantan (2nd day)", "KTN"],
    ["2027-10-09", "Birthday of Yang di-Pertua Negeri Sarawak", "SWK"],
    ["2027-10-28", "Deepavali", "-SWK", ISLAMIC_STAR],
    ["2027-11-05", "Birthday of Sultan of Perak", "PRK"],
    ["2027-12-11", "Birthday of Sultan of Selangor", "SGR"],
    ["2027-12-24", "Christmas Eve", "SBH"],
    ["2027-12-25", "Christmas Day", "ALL"],
    ["2027-12-26", "Israk and Mikraj", "KDH NSN PLS TRG"],
  ] },
};

// Replacement days appointed by state notification (not covered by the automatic rule).
const GAZETTED_REPLACEMENTS = [
  ["2026-06-03", "Wesak Day (replacement)", "SWK", "swk202"],
  ["2026-06-04", "Hari Gawai Dayak (replacement)", "SWK", "swk202"],
];

// Parsed official list for one year (used by tests to check the estimation rules).
export const officialHolidays = (y) => OFFICIAL[y].list.map(([date, name, states]) => ({ date, name, states: parseStates(states) }));

export const OFFICIAL_YEARS = Object.keys(OFFICIAL).map(Number);
export const isOfficial = (y) => OFFICIAL_YEARS.includes(y);

const DAY = 864e5;
const isoUTC = (t) => new Date(t).toISOString().slice(0, 10);
const dow = (date) => new Date(date + "T00:00Z").getUTCDay();

function parseStates(s) {
  if (s === "ALL") return "ALL";
  if (s.startsWith("-")) return { except: s.slice(1).split(" ") };
  return s.split(" ");
}

export function appliesTo(holiday, state) {
  const s = holiday.states;
  if (s === "ALL") return true;
  if (Array.isArray(s)) return s.includes(state);
  return !s.except.includes(state);
}

// ---------- Estimated holidays (years without an official list) ----------
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
// Chinese New Year (正月初一) and Wesak (15th day of the 4th lunation, counting leap months).
function chineseDates(y) {
  const months = lunarMonths(y);
  const i = months.findIndex((m) => m.month === "正月" && new Date(m.start).getUTCFullYear() === y);
  return { newYear: months[i].start, wesak: months[i + 3].start + 14 * DAY };
}

// Rules derived from the 2026 and 2027 official lists (checked by tests/holidays.test.mjs).
export function estimatedHolidays(y) {
  const list = [];
  const add = (t, name, states, extra = {}) => t != null && list.push({ date: isoUTC(t), name, states: parseStates(states), ...extra });
  const fixed = (m, d) => Date.UTC(y, m - 1, d);
  const hij = (month, day, name, states) => {
    // A Hijri date can occur twice in one Gregorian year (e.g. Israk Mikraj 2027).
    for (const off of [0, 1]) {
      const h = fromHijri(y, month, day, off);
      if (h) add(h.t, name, states, { uncertain: h.uncertain });
    }
  };
  const cn = chineseDates(y);
  add(fixed(1, 1), "New Year's Day", "-JHR KDH KTN PLS TRG");
  add(fixed(1, 14), "Birthday of Yang di-Pertuan Besar Negeri Sembilan", "NSN");
  hij(7, 27, "Israk and Mikraj", "KDH NSN PLS TRG");
  add(fixed(2, 1), "Federal Territory Day", "KUL LBN PJY");
  add(thaipusam(y), "Thaipusam", "KUL PJY JHR NSN PRK PNG SGR");
  add(cn.newYear, "Chinese New Year", "ALL");
  add(cn.newYear + DAY, "Chinese New Year (2nd day)", "ALL");
  hij(9, 1, "Awal Ramadan", "JHR KDH");
  add(fixed(2, 20), "Declaration of Independence Day (Melaka)", "MLK");
  add(fixed(3, 4), "Anniversary of Installation of Sultan of Terengganu", "TRG");
  hij(9, 17, "Nuzul Al-Quran", "KUL LBN PJY KTN PHG PRK PLS PNG SGR TRG");
  hij(10, 1, "Hari Raya Aidilfitri", "ALL");
  hij(10, 2, "Hari Raya Aidilfitri (2nd day)", "ALL");
  hij(10, 3, "Hari Raya Aidilfitri (3rd day)", "MLK");
  add(fixed(3, 23), "Birthday of Sultan of Johor", "JHR");
  add(easter(y) - 2 * DAY, "Good Friday", "SBH SWK");
  add(fixed(3, 30), "Birthday of Yang di-Pertua Negeri Sabah", "SBH");
  add(fixed(4, 26), "Birthday of Sultan of Terengganu", "TRG");
  add(fixed(5, 1), "Labour Day", "ALL");
  add(fixed(5, 17), "Birthday of Raja of Perlis", "PLS");
  add(fixed(5, 22), "Hol of Almarhum Sultan Ahmad Shah (Pahang)", "PHG");
  hij(12, 9, "Hari Arafah", "KTN TRG");
  hij(12, 10, "Hari Raya Haji", "ALL");
  hij(12, 11, "Hari Raya Haji (2nd day)", "KDH KTN PLS TRG");
  add(cn.wesak, "Wesak Day", "ALL");
  add(fixed(5, 30), "Pesta Kaamatan", "LBN SBH");
  add(fixed(5, 31), "Pesta Kaamatan (2nd day)", "LBN SBH");
  add(nthWeekday(y, 5, 1, 1), "Birthday of Yang di-Pertuan Agong", "ALL");
  add(fixed(6, 1), "Hari Gawai Dayak", "SWK");
  add(fixed(6, 2), "Hari Gawai Dayak (2nd day)", "SWK");
  hij(1, 1, "Awal Muharram", "ALL");
  add(nthWeekday(y, 5, 0, 3), "Birthday of Sultan of Kedah", "KDH");
  add(fixed(7, 7), "George Town World Heritage City Day", "PNG");
  add(nthWeekday(y, 6, 6, 2), "Birthday of Yang di-Pertua Negeri Pulau Pinang", "PNG");
  hij(2, 6, "Hol of Almarhum Sultan Iskandar (Johor)", "JHR");
  add(fixed(7, 22), "Sarawak Independence Day", "SWK");
  add(fixed(7, 30), "Birthday of Sultan of Pahang", "PHG", { uncertain: true }); // 31 Jul in 2026, 30 Jul in 2027
  hij(3, 12, "Maulidur Rasul", "ALL");
  add(fixed(8, 24), "Birthday of Yang di-Pertua Negeri Melaka", "MLK");
  add(fixed(8, 31), "National Day (Hari Kebangsaan)", "ALL");
  add(fixed(9, 16), "Malaysia Day", "ALL");
  add(fixed(9, 29), "Birthday of Sultan of Kelantan", "KTN");
  add(fixed(9, 30), "Birthday of Sultan of Kelantan (2nd day)", "KTN");
  add(nthWeekday(y, 9, 6, 2), "Birthday of Yang di-Pertua Negeri Sarawak", "SWK");
  add(deepavali(y), "Deepavali", "-SWK");
  add(nthWeekday(y, 10, 5, 1), "Birthday of Sultan of Perak", "PRK");
  add(fixed(12, 11), "Birthday of Sultan of Selangor", "SGR");
  add(fixed(12, 24), "Christmas Eve", "SBH");
  add(fixed(12, 25), "Christmas Day", "ALL");
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

// Act 369 s.3: a holiday on Sunday → next day; if that is also a holiday or a Saturday,
// the next working day. Each clashing holiday gets its own day.
function sundayReplacements(list, state) {
  if (!AUTO_REPLACE.includes(state)) return [];
  const taken = new Set(list.map((h) => h.date));
  const out = [];
  for (const h of list) {
    if (dow(h.date) !== 0) continue;
    let r = Date.parse(h.date + "T00:00Z") + DAY;
    while ([0, 6].includes(new Date(r).getUTCDay()) || taken.has(isoUTC(r))) r += DAY;
    taken.add(isoUTC(r));
    out.push({ date: isoUTC(r), name: `${h.name.replace(/ \((2nd|3rd) day\)$/, "")} (replacement)`, kind: "replacement", source: "act369", estimated: h.estimated });
  }
  return out;
}

const cache = new Map();
function yearList(state, y) {
  const key = `${state}-${y}`;
  if (cache.has(key)) return cache.get(key);
  let base;
  if (isOfficial(y)) {
    const src = OFFICIAL[y].source;
    base = OFFICIAL[y].list
      .map(([date, name, states, star]) => ({ date, name, states: parseStates(states), kind: "official", source: src, subjectToChange: !!star }))
      .filter((h) => appliesTo(h, state));
  } else {
    base = estimatedHolidays(y).filter((h) => appliesTo(h, state)).map((h) => ({ ...h, kind: "estimated", estimated: true }));
  }
  const gazetted = GAZETTED_REPLACEMENTS
    .filter(([date, , states]) => date.startsWith(`${y}-`) && parseStates(states).includes(state))
    .map(([date, name, , source]) => ({ date, name, kind: "replacement", source }));
  const list = [...base, ...sundayReplacements(base, state), ...gazetted].sort((a, b) => a.date.localeCompare(b.date));
  cache.set(key, list);
  return list;
}

// Map-like accessor over every year, computed lazily.
export function holidaysFor(state) {
  const maps = new Map();
  const yearMap = (y) => {
    if (!maps.has(y)) {
      const m = new Map();
      for (const h of yearList(state, y)) m.set(h.date, [...(m.get(h.date) || []), h]);
      maps.set(y, m);
    }
    return maps.get(y);
  };
  const yearOf = (key) => Number(key.slice(0, 4));
  return {
    get: (key) => yearMap(yearOf(key)).get(key),
    has: (key) => yearMap(yearOf(key)).has(key),
    year: yearMap,
    list: (y) => yearList(state, y),
  };
}

// Notice shown for states whose replacement days are not automatic.
export function replacementNote(state) {
  if (AUTO_REPLACE.includes(state)) return "";
  if (FRI_SAT.includes(state)) return "Replacement days (cuti ganti) in this state are announced by the state government (Friday rest day) and are not added automatically.";
  return `Replacement days in ${STATES[state]} are appointed by state notification; only gazetted ones are shown.`;
}

// ---------- School holidays (KPM) ----------
// Group A = Kedah, Kelantan, Terengganu; Group B = all other states and FTs.
export const SCHOOL_GROUP_A = ["KDH", "KTN", "TRG"];
export const SCHOOL_YEARS = { 2026: "kpm2026" };
// `states` (optional) narrows an entry within its group.
export const SCHOOL_HOLIDAYS = [
  { start: "2026-01-01", end: "2026-01-10", name: "Year-end holiday 2025/2026 (ends)", group: "A", source: "kpm2025" },
  { start: "2026-01-01", end: "2026-01-11", name: "Year-end holiday 2025/2026 (ends)", group: "B", source: "kpm2025" },
  { start: "2026-02-15", end: "2026-02-16", name: "KPM festive holiday (Chinese New Year)", group: "A", source: "kpm2026" },
  { start: "2026-02-19", end: "2026-02-19", name: "KPM festive holiday (Chinese New Year)", group: "A", source: "kpm2026" },
  { start: "2026-02-16", end: "2026-02-16", name: "KPM festive holiday (Chinese New Year)", group: "B", source: "kpm2026" },
  { start: "2026-02-19", end: "2026-02-20", name: "KPM festive holiday (Chinese New Year)", group: "B", source: "kpm2026" },
  { start: "2026-03-19", end: "2026-03-19", name: "KPM festive holiday (Hari Raya Aidilfitri)", group: "A", source: "kpm2026" },
  { start: "2026-03-19", end: "2026-03-20", name: "KPM festive holiday (Hari Raya Aidilfitri)", group: "B", source: "kpm2026" },
  { start: "2026-03-20", end: "2026-03-28", name: "Term 1 break", group: "A", source: "kpm2026" },
  { start: "2026-03-21", end: "2026-03-29", name: "Term 1 break", group: "B", source: "kpm2026" },
  { start: "2026-05-22", end: "2026-06-06", name: "Mid-year holiday", group: "A", source: "kpm2026" },
  { start: "2026-05-23", end: "2026-06-07", name: "Mid-year holiday", group: "B", source: "kpm2026" },
  { start: "2026-08-28", end: "2026-09-05", name: "Term 2 break", group: "A", source: "kpm2026" },
  { start: "2026-08-29", end: "2026-09-06", name: "Term 2 break", group: "B", source: "kpm2026" },
  { start: "2026-11-09", end: "2026-11-09", name: "KPM festive holiday (Deepavali)", group: "A", source: "kpm2026" },
  { start: "2026-11-10", end: "2026-11-10", name: "KPM festive holiday (Deepavali)", group: "B", states: "-SWK", source: "kpm2026" },
  { start: "2026-11-09", end: "2026-11-09", name: "KPM holiday (Deepavali, Sarawak)", group: "B", states: "SWK", source: "kpm2026" },
  { start: "2026-12-04", end: "2026-12-31", name: "Year-end holiday", group: "A", source: "kpm2026" },
  { start: "2026-12-05", end: "2026-12-31", name: "Year-end holiday", group: "B", source: "kpm2026" },
];

export function schoolGroup(state) {
  return SCHOOL_GROUP_A.includes(state) ? "A" : "B";
}

export function schoolHolidaysFor(state) {
  const g = schoolGroup(state);
  return SCHOOL_HOLIDAYS.filter((s) => s.group === g && (!s.states || appliesTo({ states: parseStates(s.states) }, state)));
}
