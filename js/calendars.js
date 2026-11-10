import { nextNewMoon, hijriMonthStart, newMoonsBetween, mytDay } from "./astro.js";

const DAY = 864e5;
// Chinese lunar and Hijri dates.

const lunarFmt = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", { year: "numeric", month: "long", day: "numeric" });
const DAY_NAMES = ["", "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
const ZODIAC = { 子: "鼠", 丑: "牛", 寅: "虎", 卯: "兔", 辰: "龙", 巳: "蛇", 午: "马", 未: "羊", 申: "猴", 酉: "鸡", 戌: "狗", 亥: "猪" };

// Lunar months start on the Malaysian/Chinese (UTC+8) date of each new moon, from a
// precise new-moon formula. Month names (incl. leap months) come from the browser's
// Chinese calendar read mid-month, where it is never ambiguous.
const lunarCache = new Map();
export function lunarMonths(gYear) {
  if (lunarCache.has(gYear)) return lunarCache.get(gYear);
  const out = newMoonsBetween(Date.UTC(gYear - 1, 11, 1), Date.UTC(gYear + 1, 1, 1)).map((nm) => {
    const start = mytDay(nm);
    const p = Object.fromEntries(lunarFmt.formatToParts(new Date(start + 14 * DAY)).map((x) => [x.type, x.value]));
    return { start, month: p.month, yearName: p.yearName };
  });
  lunarCache.set(gYear, out);
  return out;
}

export function lunar(date) {
  const t = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const m = lunarMonths(date.getFullYear()).filter((x) => x.start <= t).pop();
  const day = (t - m.start) / DAY + 1;
  return {
    day,
    month: m.month,                       // e.g. "十月", "闰六月"
    label: day === 1 ? m.month : DAY_NAMES[day],
    yearName: m.yearName,                 // e.g. "丙午"
    zodiac: ZODIAC[m.yearName?.slice(-1)] || "",
  };
}

// Hijri dates: month starts are computed from the Moon (MABIMS crescent criteria
// used by Malaysia), so they follow the same rule JAKIM applies. Months whose
// crescent is close to the visibility threshold are marked `uncertain`.
const HIJRI_SHORT = ["Muharram", "Safar", "R.Awal", "R.Akhir", "J.Awal", "J.Akhir",
  "Rejab", "Syaaban", "Ramadan", "Syawal", "Zulkaedah", "Zulhijjah"];
const HIJRI_MONTHS = ["Muharram", "Safar", "Rabiulawal", "Rabiulakhir", "Jamadilawal", "Jamadilakhir",
  "Rejab", "Syaaban", "Ramadan", "Syawal", "Zulkaedah", "Zulhijjah"];
const idFmt = new Intl.DateTimeFormat("en-u-ca-islamic", { year: "numeric", month: "numeric" });
const monthCache = new Map();
// Officially announced month starts that the calculation gets wrong (borderline crescents).
const KNOWN_STARTS = { "1448-1": "2026-06-17" };

// Hijri months starting from early December of (gYear - 1) to the end of January of (gYear + 1).
export function hijriMonths(gYear) {
  if (monthCache.has(gYear)) return monthCache.get(gYear);
  const out = [];
  for (let t = Date.UTC(gYear - 1, 10, 15); t < Date.UTC(gYear + 1, 1, 1); t += 20 * DAY) {
    const conj = nextNewMoon(t);
    t = conj;
    const { start, uncertain } = hijriMonthStart(conj);
    // Identify the month by the tabular Islamic calendar mid-month (never ambiguous).
    const p = Object.fromEntries(idFmt.formatToParts(new Date(start + 14 * DAY)).map((x) => [x.type, x.value]));
    const known = KNOWN_STARTS[`${p.year}-${Number(p.month)}`];
    out.push(known
      ? { start: Date.parse(known + "T00:00Z"), month: Number(p.month), year: Number(p.year), uncertain: false }
      : { start, month: Number(p.month), year: Number(p.year), uncertain });
  }
  monthCache.set(gYear, out);
  return out;
}

const utcLabel = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

export function hijri(date) {
  const t = utcLabel(date);
  const m = hijriMonths(date.getFullYear()).filter((x) => x.start <= t).pop();
  return {
    day: (t - m.start) / DAY + 1, month: m.month, year: m.year, uncertain: m.uncertain,
    monthName: HIJRI_MONTHS[m.month - 1], short: HIJRI_SHORT[m.month - 1],
  };
}

// Gregorian date (UTC-midnight label) of a Hijri day falling in Gregorian year gYear, or null.
// `occurrence` picks the 2nd match when a Hijri date occurs twice in one Gregorian year.
export function fromHijri(gYear, month, day, occurrence = 0) {
  const hits = [];
  for (const m of hijriMonths(gYear)) {
    if (m.month !== month) continue;
    const t = m.start + (day - 1) * DAY;
    if (new Date(t).getUTCFullYear() === gYear) hits.push({ t, uncertain: m.uncertain });
  }
  return hits[occurrence] || null;
}
