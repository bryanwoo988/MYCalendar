// Malaysia public holiday data.
// Sources: cross-checked third-party listings of the federal & state gazettes
// (see README). Islamic holidays depend on moon sighting and may shift by a day.
// Entries flagged `provisional: true` have not been gazetted yet.
//
// `states`: "ALL", or an array of state codes, or { except: [...] }.

export const STATES = {
  JHR: "Johor", KDH: "Kedah", KTN: "Kelantan", MLK: "Melaka",
  NSN: "Negeri Sembilan", PHG: "Pahang", PRK: "Perak", PLS: "Perlis",
  PNG: "Pulau Pinang", SBH: "Sabah", SWK: "Sarawak", SGR: "Selangor",
  TRG: "Terengganu", KUL: "W.P. Kuala Lumpur", LBN: "W.P. Labuan",
  PJY: "W.P. Putrajaya",
};

// Kedah, Kelantan and Terengganu use a Friday–Saturday weekend, so a holiday
// on Sunday is a working day there and no Monday replacement is given.
const FRI_SAT = ["KDH", "KTN", "TRG"];

export const HOLIDAYS = [
  // ---------- 2026 ----------
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
  { date: "2026-06-02", name: "Wesak Day (replacement)", states: { except: FRI_SAT } },
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

  // ---------- 2027 (provisional, not yet gazetted) ----------
  { date: "2027-01-01", name: "New Year's Day", states: { except: ["JHR", "KDH", "KTN", "PLS", "TRG"] }, provisional: true },
  { date: "2027-02-06", name: "Chinese New Year", states: "ALL", provisional: true },
  { date: "2027-02-07", name: "Chinese New Year (2nd day)", states: { except: ["KTN", "TRG"] }, provisional: true },
  { date: "2027-02-08", name: "Chinese New Year (replacement)", states: "ALL", provisional: true },
  { date: "2027-03-10", name: "Hari Raya Aidilfitri", states: "ALL", provisional: true },
  { date: "2027-03-11", name: "Hari Raya Aidilfitri (2nd day)", states: "ALL", provisional: true },
  { date: "2027-05-01", name: "Labour Day", states: "ALL", provisional: true },
  { date: "2027-05-17", name: "Hari Raya Haji", states: "ALL", provisional: true },
  { date: "2027-05-30", name: "Pesta Kaamatan", states: ["SBH", "LBN"], provisional: true },
  { date: "2027-05-31", name: "Pesta Kaamatan (2nd day)", states: ["SBH", "LBN"], provisional: true },
  { date: "2027-06-01", name: "Hari Gawai Dayak", states: ["SWK"], provisional: true },
  { date: "2027-06-02", name: "Hari Gawai Dayak (2nd day)", states: ["SWK"], provisional: true },
  { date: "2027-06-07", name: "Birthday of Yang di-Pertuan Agong", states: "ALL", provisional: true },
  { date: "2027-07-22", name: "Sarawak Day", states: ["SWK"], provisional: true },
  { date: "2027-08-31", name: "National Day (Hari Merdeka)", states: "ALL", provisional: true },
  { date: "2027-09-16", name: "Malaysia Day", states: "ALL", provisional: true },
  { date: "2027-12-25", name: "Christmas Day", states: "ALL", provisional: true },
];

export function appliesTo(holiday, state) {
  const s = holiday.states;
  if (s === "ALL" || state === "ALL") return true;
  if (Array.isArray(s)) return s.includes(state);
  return !s.except.includes(state);
}

export function holidaysFor(state) {
  const map = new Map();
  for (const h of HOLIDAYS) {
    if (!appliesTo(h, state)) continue;
    if (!map.has(h.date)) map.set(h.date, []);
    map.get(h.date).push(h);
  }
  return map;
}
