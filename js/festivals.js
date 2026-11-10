// Traditional Chinese festivals (not public holidays): lunar dates from the precise
// new-moon lunar calendar, Qingming and Dongzhi from the Sun's longitude (15° and 270°),
// all at UTC+8. Checked against 2020–2027 dates in tests.
import { lunarMonths } from "./calendars.js";
import { sun } from "./astro.js";

const DAY = 864e5, HOUR = 36e5;
const iso = (t) => new Date(t).toISOString().slice(0, 10);

// [lunar month, day, key] — key indexes NAMES below
const LUNAR = [
  ["正月", 9, "tiangong"], ["正月", 15, "yuanxiao"], ["五月", 5, "duanwu"], ["七月", 7, "qixi"],
  ["七月", 15, "zhongyuan"], ["八月", 15, "zhongqiu"], ["九月", 9, "chongyang"], ["腊月", 8, "laba"],
];

export const FESTIVAL_NAMES = {
  chuxi: { zh: "除夕", en: "Chinese New Year's Eve", ms: "Malam Tahun Baharu Cina" },
  chunjie: { zh: "春节", en: "Chinese New Year", ms: "Tahun Baharu Cina" },
  tiangong: { zh: "天公诞", en: "Jade Emperor's Birthday (Pai Ti Kong)", ms: "Hari Lahir Jade Emperor (Pai Ti Kong)" },
  yuanxiao: { zh: "元宵节", en: "Chap Goh Mei (Lantern Festival)", ms: "Chap Goh Mei" },
  qingming: { zh: "清明节", en: "Qingming (Tomb Sweeping)", ms: "Cheng Beng" },
  duanwu: { zh: "端午节", en: "Dragon Boat Festival", ms: "Pesta Perahu Naga" },
  qixi: { zh: "七夕", en: "Qixi (Chinese Valentine's Day)", ms: "Qixi" },
  zhongyuan: { zh: "中元节", en: "Hungry Ghost Festival", ms: "Pesta Hantu Lapar" },
  zhongqiu: { zh: "中秋节", en: "Mid-Autumn Festival", ms: "Pesta Kuih Bulan" },
  chongyang: { zh: "重阳节", en: "Double Ninth Festival", ms: "Pesta Chung Yeung" },
  dongzhi: { zh: "冬至", en: "Dongzhi (Winter Solstice)", ms: "Dongzhi" },
  laba: { zh: "腊八节", en: "Laba Festival", ms: "Pesta Laba" },
};

// UTC+8 calendar date (as YYYY-MM-DD) when the Sun reaches ecliptic longitude `deg`.
export function solarTerm(y, deg, startMonth) {
  const f = (t) => ((sun(t).lon - deg + 540) % 360) - 180;
  for (let t = Date.UTC(y, startMonth, 1); t < Date.UTC(y + 1, 0, 1); t += HOUR) {
    if (f(t) < 0 && f(t + HOUR) >= 0) {
      let lo = t, hi = t + HOUR;
      for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; }
      return iso(lo + 8 * HOUR);
    }
  }
  return null;
}

const cache = new Map();
export function festivalsFor(y) {
  if (cache.has(y)) return cache.get(y);
  const out = new Map();
  const add = (date, key) => {
    if (!date?.startsWith(`${y}-`) || (out.get(date) || []).some((f) => f.key === key)) return;
    out.set(date, [...(out.get(date) || []), { key, names: FESTIVAL_NAMES[key] }]);
  };
  for (const yy of [y - 1, y]) {
    const months = lunarMonths(yy).filter((m) => !m.month.startsWith("闰"));
    for (const [mName, day, key] of LUNAR) {
      for (const m of months.filter((x) => x.month === mName)) add(iso(m.start + (day - 1) * DAY), key);
    }
    for (const m of months.filter((x) => x.month === "正月")) {
      add(iso(m.start), "chunjie");
      add(iso(m.start - DAY), "chuxi");
    }
  }
  add(solarTerm(y, 15, 2), "qingming");
  add(solarTerm(y, 270, 11), "dongzhi");
  cache.set(y, out);
  return out;
}
