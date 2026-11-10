// The 12 zodiac signs (生肖). A sign runs from Chinese New Year to the day before the next one,
// so people born in January or early February often belong to the previous year's sign.
import { lunarMonths } from "./calendars.js";

const DAY = 864e5;
export const SIGNS = [
  { emoji: "🐀", zh: "鼠", en: "Rat", ms: "Tikus" },
  { emoji: "🐂", zh: "牛", en: "Ox", ms: "Lembu" },
  { emoji: "🐅", zh: "虎", en: "Tiger", ms: "Harimau" },
  { emoji: "🐇", zh: "兔", en: "Rabbit", ms: "Arnab" },
  { emoji: "🐉", zh: "龙", en: "Dragon", ms: "Naga" },
  { emoji: "🐍", zh: "蛇", en: "Snake", ms: "Ular" },
  { emoji: "🐎", zh: "马", en: "Horse", ms: "Kuda" },
  { emoji: "🐐", zh: "羊", en: "Goat", ms: "Kambing" },
  { emoji: "🐒", zh: "猴", en: "Monkey", ms: "Monyet" },
  { emoji: "🐓", zh: "鸡", en: "Rooster", ms: "Ayam" },
  { emoji: "🐕", zh: "狗", en: "Dog", ms: "Anjing" },
  { emoji: "🐖", zh: "猪", en: "Pig", ms: "Babi" },
];
const STEMS = "甲乙丙丁戊己庚辛壬癸", BRANCHES = "子丑寅卯辰巳午未申酉戌亥";

// Range covered: the lunar calendar here uses UTC+8, which China adopted in 1929.
export const FIRST_YEAR = 1930, LAST_YEAR = 2050;

/** Sign index (0 = Rat) of the lunar year that begins in Gregorian year y. */
export const signOfYear = (y) => (((y - 4) % 12) + 12) % 12;
export const ganzhi = (y) => STEMS[(((y - 4) % 10) + 10) % 10] + BRANCHES[signOfYear(y)];

const cnyCache = new Map();
/** Chinese New Year (UTC-midnight label of the UTC+8 date) of Gregorian year y. */
export function chineseNewYear(y) {
  if (!cnyCache.has(y)) {
    const m = lunarMonths(y).find((x) => x.month === "正月" && new Date(x.start).getUTCFullYear() === y);
    cnyCache.set(y, m.start);
  }
  return cnyCache.get(y);
}

/** Sign index for a birth date (Date or YYYY-MM-DD). */
export function signOfDate(d) {
  const t = typeof d === "string" ? Date.parse(d + "T00:00Z") : Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const y = new Date(t).getUTCFullYear();
  return signOfYear(t >= chineseNewYear(y) ? y : y - 1);
}

/** Every lunar year of a sign in [FIRST_YEAR, LAST_YEAR], with exact start and end dates. */
export function yearsOfSign(i) {
  const out = [];
  for (let y = FIRST_YEAR + ((i - signOfYear(FIRST_YEAR) + 12) % 12); y <= LAST_YEAR; y += 12) {
    const start = chineseNewYear(y), end = chineseNewYear(y + 1) - DAY;
    out.push({ year: y, ganzhi: ganzhi(y), start: new Date(start).toISOString().slice(0, 10), end: new Date(end).toISOString().slice(0, 10) });
  }
  return out;
}
