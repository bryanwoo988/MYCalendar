// Chinese lunar and Hijri dates via the browser's built-in Intl calendars.

const lunarFmt = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", { year: "numeric", month: "long", day: "numeric" });
const DAY_NAMES = ["", "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
const ZODIAC = { 子: "鼠", 丑: "牛", 寅: "虎", 卯: "兔", 辰: "龙", 巳: "蛇", 午: "马", 未: "羊", 申: "猴", 酉: "鸡", 戌: "狗", 亥: "猪" };

export function lunar(date) {
  const p = Object.fromEntries(lunarFmt.formatToParts(date).map((x) => [x.type, x.value]));
  const day = Number(p.day);
  return {
    day,
    month: p.month,                       // e.g. "十月", "闰六月"
    label: day === 1 ? p.month : DAY_NAMES[day],
    yearName: p.yearName,                 // e.g. "丙午"
    zodiac: ZODIAC[p.yearName?.slice(-1)] || "",
  };
}

// Malaysia (JAKIM) dates matched Intl's astronomical "islamic" calendar shifted by
// one day for every 2026 Islamic holiday checked (Nuzul Al-Quran, Aidilfitri,
// Aidiladha, Awal Muharram, Maulidur Rasul). Treat as approximate.
const hijriFmt = new Intl.DateTimeFormat("en-u-ca-islamic", { year: "numeric", month: "numeric", day: "numeric" });
const HIJRI_SHORT = ["Muharram", "Safar", "R.Awal", "R.Akhir", "J.Awal", "J.Akhir",
  "Rejab", "Syaaban", "Ramadan", "Syawal", "Zulkaedah", "Zulhijjah"];
const HIJRI_MONTHS = ["Muharram", "Safar", "Rabiulawal", "Rabiulakhir", "Jamadilawal", "Jamadilakhir",
  "Rejab", "Syaaban", "Ramadan", "Syawal", "Zulkaedah", "Zulhijjah"];

export function hijri(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  const p = Object.fromEntries(hijriFmt.formatToParts(d).map((x) => [x.type, x.value]));
  const month = Number(p.month);
  return { day: Number(p.day), month, monthName: HIJRI_MONTHS[month - 1], short: HIJRI_SHORT[month - 1], year: Number(p.year) };
}
