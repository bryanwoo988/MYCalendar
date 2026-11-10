import { STATES, holidaysFor, isOfficial, OFFICIAL_YEARS, replacementNote, SOURCES, SCHOOL_YEARS,
  schoolHolidaysFor, schoolGroup, FRI_SAT, allStatesHolidays, isNational } from "./data.js";
import { lunar, hijri } from "./calendars.js";
import { buildICS } from "./ics.js";
import { longWeekends } from "./longweekend.js";
import { COUNTRIES, COUNTRY_SOURCES, countryHolidays, countryYears } from "./countries.js";
import { festivalsFor } from "./festivals.js";
import { t, setLang, getLang, applyStatic, LANGS, MONTHS, MONTH_TILE, WEEKDAYS, LOCALE,
  holidayName, schoolName, stateName } from "./i18n.js";

// Holidays are calculated for any year; offer last year through ten years ahead.
const YEARS = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - 1 + i);
const CATS = ["public", "school", "long", "compare"];
const WD_ZH = ["日", "一", "二", "三", "四", "五", "六"];
const WD_MS = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
const LIGHT_THEMES = ["classic", "paper", "mint", "lavender"];
const DARK_THEMES = ["midnight", "oled", "slate", "grape"];

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => new Date(s + "T00:00:00");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const loc = () => LOCALE[getLang()];
const fmtShort = (s) => parse(s).toLocaleDateString(loc(), { day: "numeric", month: "short", weekday: "short" });
const monthName = (m) => MONTHS[getLang()][m];
const wd = (d) => WEEKDAYS[getLang()][d];
const sName = (code) => (code === "ALL" ? t("lw.allStates") : stateName(code, STATES[code]));

const store = {
  get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

const today = new Date();
const st = {
  region: store.get("region", "KUL"),
  year: YEARS.includes(today.getFullYear()) ? today.getFullYear() : 2026,
  events: store.get("events", {}),
  lwScope: store.get("lwScope", "mine"),
  lwLeave: store.get("lwLeave", 1),
  lang: store.get("lang", guessLang()),
  apMode: store.get("apMode", "system"),
  apLight: store.get("apLight", "classic"),
  apDark: store.get("apDark", "midnight"),
  country: store.get("country", "MY"),
  cmp: store.get("cmp", null),
  day: null,
};
setLang(st.lang);
const isMY = () => st.country === "MY";
const isAll = () => isMY() && st.region === "ALL";
const providerFor = (cc, state = st.region) => (cc === "MY" ? (state === "ALL" ? allStatesHolidays() : holidaysFor(state)) : countryHolidays(cc));
let hol = providerFor(st.country);
const cName = (cc) => COUNTRIES[cc][getLang()] || COUNTRIES[cc].en;
const cLabel = (cc) => `${COUNTRIES[cc].flag} ${cName(cc)}`;
// Display name of a holiday entry (Malaysian entries are translated; others carry their own names).
const hName = (h) => (h.names ? h.names[getLang()] || h.names.en : holidayName(h.name));
const placeLabel = () => (isMY() ? sName(st.region) : cName(st.country));

function guessLang() {
  const l = (navigator.language || "").toLowerCase();
  return l.startsWith("zh") ? "zh" : l.startsWith("ms") || l.startsWith("id") ? "ms" : "en";
}

// ---------- lookups ----------
const festOn = (key) => festivalsFor(Number(key.slice(0, 4))).get(key) || [];
const fName = (f) => f.names[getLang()] || f.names.en;
const schoolOn = (dateIso) => (isMY() ? schoolHolidaysFor(st.region).find((s) => dateIso >= s.start && dateIso <= s.end) : null);
const srcLink = (key, full = false) => `<a href="${SOURCES[key].url}" target="_blank" rel="noopener">${esc(full ? SOURCES[key].label : SOURCES[key].short)}</a>`;
const SRC_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3v4h4M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const srcRowList = (list) => `<div class="src">${SRC_ICON}<span>${t("source")}: ${list.map((x) => `<a href="${x.url}" target="_blank" rel="noopener">${esc(x.short)}</a>`).join(" · ")}</span></div>`;
const srcRow = (keys) => `<div class="src">${SRC_ICON}<span>${t("source")}: ${keys.map((k) => srcLink(k)).join(" · ")}</span></div>`;

function monthInfo(y, m) {
  const first = new Date(y, m, 1);
  const days = new Date(y, m + 1, 0).getDate();
  const offset = first.getDay();
  return { days, offset, weeks: Math.ceil((offset + days) / 7) };
}
const monthTitle = (y, m) => (getLang() === "zh" ? `${y}年${monthName(m)}` : `${monthName(m)} ${y}`);

// ---------- home ----------
function renderYears() {
  $("years").innerHTML = YEARS.map((y) =>
    `<button class="year" data-year="${y}" aria-current="${y === st.year}">${y}</button>`).join("");
  $("years").querySelector('[aria-current="true"]')?.scrollIntoView({ inline: "center", block: "nearest" });
}

function miniCalendar(y, m) {
  const { days, offset } = monthInfo(y, m);
  const rows = WEEKDAYS.en.map((_, dow) => {
    const cols = Array(6).fill("<span></span>");
    for (let d = 1; d <= days; d++) {
      if ((offset + d - 1) % 7 !== dow) continue;
      const key = `${y}-${pad(m + 1)}-${pad(d)}`;
      const red = dow === 0 || (hol.get(key) || []).some((h) => h.kind !== "workday" && isNational(h));
      cols[Math.floor((offset + d - 1) / 7)] = `<span class="${red ? "r" : ""}">${d}</span>`;
    }
    return `<div class="row"><span class="wd">${wd(dow)}</span>${cols.join("")}</div>`;
  });
  return `<div class="mini" aria-hidden="true"><div class="strip"></div>${rows.join("")}</div>`;
}

function renderMonths() {
  const nowKey = `${today.getFullYear()}-${today.getMonth()}`;
  $("months").innerHTML = MONTH_TILE[getLang()].map((label, m) => `
    <button class="thumb ${nowKey === `${st.year}-${m}` ? "now" : ""}" data-month="${m}" aria-label="${esc(monthTitle(st.year, m))}">
      ${miniCalendar(st.year, m)}
      <span class="label ${label.length > 4 ? "long" : ""}">${label}</span>
    </button>`).join("");
}

// ---------- items ----------
const holItem = (h) => ({ type: h.kind === "workday" ? "work" : "public", text: hName(h), kind: h.kind, unc: h.uncertain, star: h.subjectToChange,
  scope: h.codes && !isNational(h) ? statesSummary(h.codes) : null });

function itemsForDay(key) {
  const out = (hol.get(key) || []).map(holItem);
  // Traditional festivals are listed only on days without a public holiday (avoids duplicates like 中秋节 twice).
  if (!out.some((it) => it.type === "public")) for (const f of festOn(key)) out.push({ type: "fest", text: fName(f) });
  const s = schoolOn(key);
  if (s) out.push({ type: "school", text: schoolName(s.name), raw: s.name });
  (st.events[key] || []).forEach((e, i) => out.push({ type: "evt", text: e, idx: i }));
  return out;
}

function tagFor(it) {
  if (it.type === "fest") return `<span class="tag fest">${t("tag.fest")}</span>`;
  if (it.type === "work") return `<span class="tag repl">${t("tag.workday")}</span>`;
  if (it.type !== "public") return "";
  if (it.kind === "bridge") return `<span class="tag repl">${t("tag.bridge")}</span>`;
  if (it.kind === "regional") return `<span class="tag est">${t("tag.regional")}</span>`;
  if (it.kind === "unconfirmed") return `<span class="tag est">${t("tag.unconfirmed")}</span>`;
  if (it.kind === "estimated") return `<span class="tag est">${t(it.unc ? "tag.estUnc" : "tag.est")}</span>`;
  if (it.kind === "replacement") return `<span class="tag repl">${t("tag.repl")}</span>`;
  if (it.star) return `<span class="tag est">${t("tag.change")}</span>`;
  return "";
}

function listItem(key, it, when = fmtShort(key)) {
  return `<li class="item t-${it.type}" data-date="${key}">
    <span class="mark" aria-hidden="true"></span>
    <span class="body"><span class="what">${esc(it.text)}</span>${when ? `<span class="when">${when}</span>` : ""}${it.scope ? `<span class="scope">${esc(it.scope)}</span>` : ""}</span>
    ${tagFor(it)}${it.type === "evt" && it.idx != null && !when ? `<button class="x" data-del="${it.idx}" aria-label="${t("delete")}">✕</button>` : ""}
  </li>`;
}

// ---------- month page ----------
function renderMonthPage(y, m) {
  const { days, offset, weeks } = monthInfo(y, m);
  const l1 = lunar(new Date(y, m, 1)), l2 = lunar(new Date(y, m, days));
  const h1 = hijri(new Date(y, m, 1)), h2 = hijri(new Date(y, m, days));
  $("m-title").innerHTML = getLang() === "zh"
    ? `${y}年${monthName(m)}<small>${MONTHS.en[m]}</small>`
    : `${monthName(m)} ${y}<small>${MONTHS.zh[m]}</small>`;
  $("m-sub").textContent =
    `${l1.yearName}${l1.zodiac}年${l1.yearName === l2.yearName ? "" : ` – ${l2.yearName}${l2.zodiac}年`} · 农历${l1.month === l2.month ? l1.month : `${l1.month} – ${l2.month}`} · ` +
    `${h1.monthName}${h1.monthName === h2.monthName ? "" : ` – ${h2.monthName}`} ${h2.year}H`;

  const todayKey = iso(today);
  const rows = WEEKDAYS.en.map((_, dow) => {
    const cells = Array.from({ length: weeks }, () => '<span class="cell empty"></span>');
    for (let d = 1; d <= days; d++) {
      if ((offset + d - 1) % 7 !== dow) continue;
      const date = new Date(y, m, d);
      const key = iso(date);
      const lu = lunar(date), hj = hijri(date);
      const all = hol.get(key) || [];
      const hs = all.filter((h) => h.kind !== "workday");
      const work = all.length > hs.length;
      const cls = ["cell"];
      const national = hs.some((h) => isNational(h));
      if ((dow === 0 && !work) || national) cls.push("red");
      if (national) cls.push("hol");
      else if (hs.length) cls.push("hol-part");
      if (work) cls.push("work");
      if (schoolOn(key)) cls.push("school");
      if (key === todayKey) cls.push("today");
      cells[Math.floor((offset + d - 1) / 7)] = `
        <button class="${cls.join(" ")}" data-date="${key}" aria-label="${esc(`${fmtShort(key)}${hs.length ? ", " + hs.map(hName).join(", ") : ""}`)}">
          <span class="g">${d}</span>
          ${festOn(key).length
            ? `<span class="lu fest">${esc(festOn(key)[0].names.zh)}</span>`
            : `<span class="lu ${lu.day === 1 || lu.day === 15 ? "first" : ""}">${lu.label}</span>`}
          <span class="hj">${hj.day === 1 ? hj.short : hj.day}</span>
          ${hs.length ? `<span class="hn">${esc(hName(hs[0]))}</span>` : ""}
          ${work ? `<span class="wk">${getLang() === "zh" ? "班" : "W"}</span>` : ""}
          ${st.events[key]?.length ? '<span class="ev"></span>' : ""}
        </button>`;
    }
    const sub = getLang() === "zh" ? `周${WD_ZH[dow]}` : getLang() === "ms" ? WD_ZH[dow] : `${WD_ZH[dow]} · ${WD_MS[dow]}`;
    return `<div class="trow ${dow === 0 ? "sun" : ""}" style="--weeks:${weeks}">
      <div class="wdl"><b>${getLang() === "zh" ? WEEKDAYS.en[dow] : wd(dow)}</b><span>${sub}</span></div>${cells.join("")}</div>`;
  });
  $("m-grid").innerHTML = rows.join("");
  $("legend-part").hidden = !isAll();

  const memo = [];
  for (let d = 1; d <= days; d++) {
    const key = `${y}-${pad(m + 1)}-${pad(d)}`;
    for (const it of itemsForDay(key)) {
      if (it.type === "school" && d > 1 && schoolOn(`${y}-${pad(m + 1)}-${pad(d - 1)}`)?.name === it.raw) continue;
      memo.push(listItem(key, it));
    }
  }
  $("m-list").innerHTML = memo.join("") || `<li class="empty">${t("nothingMonth")}</li>`;
}

// ---------- category lists ----------
function statesSummary(codes) {
  const allCodes = Object.keys(STATES);
  if (codes.length === allCodes.length) return t("lw.allStatesShort");
  const sep = getLang() === "zh" ? "、" : ", ";
  const names = (list) => list.map((c) => sName(c).replace(/^W\.P\. /, ""));
  const missing = allCodes.filter((c) => !codes.includes(c));
  if (codes.length > allCodes.length / 2) return t("lw.except", { list: names(missing).join(sep) });
  const n = names(codes);
  const list = n.length > 4 ? `${n.slice(0, 3).join(sep)} ${t("lw.more", { n: n.length - 3 })}` : n.join(sep);
  return t("lw.only", { list });
}

function renderLong(y) {
  const c = $("l-controls");
  c.hidden = false;
  c.innerHTML = `
    ${isMY() && !isAll() ? `<div class="seg" role="group">
      <button data-lw-scope="mine" aria-pressed="${st.lwScope === "mine"}">${esc(sName(st.region))}</button>
      <button data-lw-scope="all" aria-pressed="${st.lwScope === "all"}">${t("lw.allStates")}</button>
    </div>` : ""}
    <div class="seg" role="group">
      ${[0, 1, 2].map((n) => `<button data-lw-leave="${n}" aria-pressed="${st.lwLeave === n}">${n === 0 ? t("lw.noLeave") : t("lw.plusLeave", { n })}</button>`).join("")}
    </div>
    <div class="lw-legend"><span class="chip weekend">${t("lw.weekend")}</span><span class="chip holiday">${t("lw.holiday")}</span><span class="chip leave">${t("lw.leave")}</span></div>`;

  const all = isMY() && (isAll() || st.lwScope === "all");
  const list = isMY()
    ? longWeekends(y, all ? Object.keys(STATES) : [st.region], st.lwLeave)
    : longWeekends(y, [st.country], st.lwLeave, (cc) => ({ hol: providerFor(cc), weekend: [0, 6] }));
  const notes = all ? [`<div class="pill-note">${t("lw.showingAll")}</div>`] : [];
  if (isMY() && !isOfficial(y)) notes.push(`<div class="notice">${t("lw.estimated")}</div>`);
  if (!isMY() && !countryYears(st.country).includes(y)) notes.push(`<div class="notice">${t("noOfficial", { c: cName(st.country), y })}</div>`);
  if (isMY() && !all) notes.push(replNotice());
  $("l-note").innerHTML = notes.join("");

  const rows = [];
  let lastM = -1;
  for (const w of list) {
    const m = parse(w.holidays[0].date).getMonth();
    if (m !== lastM) { rows.push(`<li class="mhead">${monthName(m)}</li>`); lastM = m; }
    const title = [...new Set(w.holidays.map((h) => (h.names ? hName(h).replace(/（补假）|（第二天）| \((substitute|observed|2nd day)\)/g, "") : holidayName(h.name.replace(/ \((replacement|2nd day|3rd day)\)$/, "")))))].join(" / ");
    const chips = w.days.map((d, i) => {
      const dt = parse(d.date);
      const extra = i > 0 && dt.getDate() === 1 ? ` ${MONTH_TILE.en[dt.getMonth()].slice(0, 3)}` : "";
      const day = getLang() === "zh" ? (extra ? `${dt.getMonth() + 1}月${dt.getDate()}日` : dt.getDate()) : `${dt.getDate()}${extra}`;
      return `<span class="chip ${d.type}">${wd(dt.getDay())} ${day}</span>`;
    }).join("");
    const cards = w.holidays.map((h) => {
      const dt = parse(h.date);
      return `<button class="hcard" data-date="${h.date}">
        <span class="dbox"><small>${wd(dt.getDay())}</small><b>${dt.getDate()}</b></span>
        <span><span class="hname">${esc(hName(h))}</span>${all ? `<br><span class="hstates">${esc(statesSummary(h.states))}</span>` : ""}</span>
      </button>`;
    }).join("");
    const leaveTxt = w.leave ? t(w.leave > 1 ? "lw.leaveDaysPl" : "lw.leaveDays", { n: w.leave }) : t("lw.noLeaveNeeded");
    rows.push(`<li class="lw">
      <h3>${esc(title)}</h3>
      <div class="meta"><span class="days">${t("lw.daysOff", { n: w.days.length })}</span><span>${leaveTxt}</span>${w.estimated ? `<span class="tag est">${t("tag.est")}</span>` : ""}</div>
      <div class="chips">${chips}</div>
      ${cards}
    </li>`);
  }
  $("l-list").innerHTML = rows.join("") || `<li class="empty">${t("lw.none")}</li>`;
}

function replNotice() {
  if (isAll() || !replacementNote(st.region)) return "";
  return `<div class="notice">${esc(FRI_SAT.includes(st.region) ? t("replFriSat") : t("replOther", { s: sName(st.region) }))}</div>`;
}

// ---------- compare (trip planning) ----------
function compareTarget() {
  const c = st.cmp && st.cmp !== st.country ? st.cmp : st.country === "TW" ? "MY" : "TW";
  return c;
}

function renderCompare(y) {
  const dest = compareTarget();
  const destHol = providerFor(dest);
  const c = $("l-controls");
  c.hidden = false;
  c.innerHTML = `
    <label class="cmp-pick"><span>${t("cmp.with")}</span>
      <select id="cmp-sel">${Object.keys(COUNTRIES).filter((k) => k !== st.country).map((k) => `<option value="${k}" ${k === dest ? "selected" : ""}>${esc(cLabel(k))}</option>`).join("")}</select>
    </label>
    <div class="seg" role="group">
      ${[0, 1, 2].map((n) => `<button data-lw-leave="${n}" aria-pressed="${st.lwLeave === n}">${n === 0 ? t("lw.noLeave") : t("lw.plusLeave", { n })}</button>`).join("")}
    </div>
    <div class="lw-legend"><span class="chip weekend">${t("lw.weekend")}</span><span class="chip holiday">${t("lw.holiday")}</span><span class="chip leave">${t("lw.leave")}</span><span class="chip dest">${esc(cName(dest))}</span></div>`;

  const notes = [`<div class="pill-note">${t("cmp.intro")}</div>`];
  if (dest !== "MY" && !countryYears(dest).includes(y)) notes.push(`<div class="notice">${t("cmp.noData", { c: cName(dest), y })}</div>`);
  if (!isMY() && !countryYears(st.country).includes(y)) notes.push(`<div class="notice">${t("cmp.noData", { c: cName(st.country), y })}</div>`);
  $("l-note").innerHTML = notes.join("");

  const home = isMY()
    ? longWeekends(y, isAll() ? Object.keys(STATES) : [st.region], st.lwLeave)
    : longWeekends(y, [st.country], st.lwLeave, (cc) => ({ hol: providerFor(cc), weekend: [0, 6] }));
  const rows = [`<li class="mhead">${esc(t("cmp.yourBreaks"))} · ${esc(cLabel(st.country))}${isMY() ? ` ${esc(sName(st.region))}` : ""}</li>`];
  for (const w of home) {
    const destDays = w.days.map((d) => ({ d, hs: destHol.get(d.date) || [] }));
    const destOff = destDays.filter((x) => x.hs.some((h) => h.kind !== "workday"));
    const destWork = destDays.filter((x) => x.hs.some((h) => h.kind === "workday"));
    const chips = w.days.map((d) => {
      const dt = parse(d.date);
      const destMark = (destHol.get(d.date) || []).some((h) => h.kind !== "workday") ? " has-dest" : "";
      return `<span class="chip ${d.type}${destMark}">${wd(dt.getDay())} ${dt.getDate()}</span>`;
    }).join("");
    const destNames = [...new Set(destOff.flatMap((x) => x.hs.filter((h) => h.kind !== "workday").map(hName)))];
    const verdict = destOff.length
      ? `<div class="cmp-verdict busy">${COUNTRIES[dest].flag} ${esc(destNames.join(" / "))}<br><small>${esc(t("cmp.busy", { c: cName(dest) }))}</small></div>`
      : `<div class="cmp-verdict calm">${COUNTRIES[dest].flag} ${esc(t("cmp.normal", { c: cName(dest) }))}</div>`;
    const workNote = destWork.length ? `<div class="cmp-verdict">${esc(t("cmp.workday", { c: cName(dest) }))} (${destWork.map((x) => fmtShort(x.d.date)).join(", ")})</div>` : "";
    const homeNames = [...new Set(w.holidays.map((h) => hName(h)))].join(" / ");
    const leaveTxt = w.leave ? t(w.leave > 1 ? "lw.leaveDaysPl" : "lw.leaveDays", { n: w.leave }) : t("lw.noLeaveNeeded");
    rows.push(`<li class="lw">
      <h3>${esc(homeNames)}</h3>
      <div class="meta"><span class="days">${t("lw.daysOff", { n: w.days.length })}</span><span>${leaveTxt}</span><span>${fmtShort(w.days[0].date)} – ${fmtShort(w.days.at(-1).date)}</span>${isAll() ? `<span>· ${esc(statesSummary(w.states))}</span>` : ""}</div>
      <div class="chips">${chips}</div>
      ${verdict}${workNote}
    </li>`);
  }
  if (home.length === 0) rows.push(`<li class="empty">${t("lw.none")}</li>`);

  // Both calendars, merged by date
  rows.push(`<li class="mhead">${esc(t("cmp.both"))}</li>`);
  const dates = new Set([...hol.year(y).keys(), ...destHol.year(y).keys()]);
  let lastM = -1;
  for (const k of [...dates].sort()) {
    const m = parse(k).getMonth();
    if (m !== lastM) { rows.push(`<li class="mhead sub">${monthName(m)}</li>`); lastM = m; }
    const a = (hol.get(k) || []), b = (destHol.get(k) || []);
    const off = (x) => x.some((h) => h.kind !== "workday");
    const line = (cc, list) => list.map((h) => `<span class="cmp-line">${COUNTRIES[cc].flag} ${esc(hName(h))}${h.kind === "workday" ? ` <span class="tag repl">${t("tag.workday")}</span>` : ""}</span>`).join("");
    rows.push(`<li class="item t-${off(a) && off(b) ? "both" : off(a) ? "public" : "dest"}" data-date="${k}">
      <span class="mark" aria-hidden="true"></span>
      <span class="body"><span class="when">${fmtShort(k)}${off(a) && off(b) ? ` · <b>${t("cmp.bothOff")}</b>` : ""}</span>${line(st.country, a)}${line(dest, b)}</span>
    </li>`);
  }
  $("l-list").innerHTML = rows.join("");
}

function renderList(cat, y) {
  $("l-controls").hidden = true;
  if (cat === "long") return renderLong(y);
  if (cat === "compare") return renderCompare(y);
  const rows = [];
  let note = "";
  if (cat === "public" && !isMY()) {
    const has = countryYears(st.country).includes(y);
    note = has ? srcRowList(COUNTRY_SOURCES[st.country]) : `<div class="notice">${t("noOfficial", { c: cName(st.country), y })}</div>`;
    const yearMap = hol.year(y);
    let lastM = -1;
    for (const k of [...yearMap.keys()].sort()) {
      const m = parse(k).getMonth();
      if (m !== lastM) { rows.push(`<li class="mhead">${monthName(m)}</li>`); lastM = m; }
      for (const h of yearMap.get(k)) rows.push(listItem(k, holItem(h)));
    }
  } else if (cat === "public") {
    if (isOfficial(y)) {
      const keys = [`hka${y}`];
      if (hol.list(y).some((h) => h.kind === "replacement")) keys.push("act369");
      if (y === 2026 && (st.region === "SWK" || isAll())) keys.push("swk202");
      note += srcRow(keys);
    } else {
      note += `<div class="notice">${t("notGazetted", { years: OFFICIAL_YEARS.join(" & ") })}</div>`;
    }
    note += replNotice();
    const yearMap = hol.year(y);
    let lastM = -1;
    for (const k of [...yearMap.keys()].sort()) {
      const m = parse(k).getMonth();
      if (m !== lastM) { rows.push(`<li class="mhead">${monthName(m)}</li>`); lastM = m; }
      for (const h of yearMap.get(k)) rows.push(listItem(k, holItem(h)));
    }
  } else if (cat === "school") {
    const g = isAll() ? null : schoolGroup(st.region);
    const items = schoolHolidaysFor(st.region).filter((s) => s.start.startsWith(`${y}-`)).sort((a, b) => a.start.localeCompare(b.start) || a.group.localeCompare(b.group));
    note = `<div class="pill-note">${t(g === null ? "groupBoth" : g === "A" ? "groupA" : "groupB")}</div>`;
    if (SCHOOL_YEARS[y]) note += srcRow([SCHOOL_YEARS[y], ...(items.some((s) => s.source === "kpm2025") ? ["kpm2025"] : [])]);
    for (const s of items) {
      const n = Math.round((parse(s.end) - parse(s.start)) / 864e5) + 1;
      const when = s.start === s.end ? fmtShort(s.start) : `${fmtShort(s.start)} – ${fmtShort(s.end)}`;
      rows.push(listItem(s.start, { type: "school", text: schoolName(s.name), scope: isAll() ? t(s.group === "A" ? "groupTagA" : "groupTagB") : null }, `${when}${n > 1 ? ` · ${t("days", { n })}` : ""}`));
    }
  }
  $("l-note").innerHTML = note;
  const notYet = cat === "public" ? t("noOfficial", { c: cName(st.country), y }) : `${t("noSchool", { y })} ${srcLink("moe")}.`;
  $("l-list").innerHTML = rows.join("") || `<li class="empty">${notYet}</li>`;
}

// ---------- day sheet ----------
function openDay(key) {
  st.day = key;
  const date = parse(key);
  const lu = lunar(date), hj = hijri(date);
  $("d-title").textContent = date.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("d-sub").textContent = `${getLang() === "zh" ? "农历" : "Lunar"} ${lu.month}${lu.day === 1 ? "初一" : lu.label} · ${hj.day} ${hj.monthName} ${hj.year}H`;
  $("d-list").innerHTML = itemsForDay(key).map((it) => listItem(key, it, "")).join("") || `<li class="empty">${t("nothingDay")}</li>`;
  if (!$("day").open) $("day").showModal();
}

// ---------- routing ----------
function route() {
  const [, kind, a, b] = location.hash.split("/");
  const views = { home: $("home"), month: $("month"), list: $("list") };
  let show = "home";
  if (kind === "m" && a) {
    const [y, m] = a.split("-").map(Number);
    renderMonthPage(y, m - 1);
    $("bar-title").textContent = monthTitle(y, m - 1);
    show = "month";
  } else if (kind === "c" && CATS.includes(a)) {
    const y = Number(b) || st.year;
    renderList(a, y);
    $("bar-title").textContent = `${t(`cat.${a}`)} ${y}`;
    show = "list";
  } else {
    renderYears();
    renderMonths();
    $("bar-title").textContent = isMY() ? t("appTitle") : t("calendarOf", { c: cName(st.country) });
  }
  for (const [k, el] of Object.entries(views)) el.hidden = k !== show;
  document.querySelector('[data-cat="school"]').hidden = !isMY();
  $("state-pick").hidden = !isMY();
  $("country-chip").hidden = isMY();
  $("country-chip").textContent = cLabel(st.country);
  $("back").hidden = show === "home";
  window.scrollTo(0, 0);
}

function rerender() {
  hol = providerFor(st.country);
  route();
  if ($("day").open && st.day) openDay(st.day);
}

// ---------- settings: language ----------
function renderStateOptions() {
  $("state").innerHTML = ["ALL", ...Object.keys(STATES)].map((c) => `<option value="${c}">${esc(sName(c))}</option>`).join("");
  $("state").value = st.region;
}

function renderCountrySelect() {
  $("country-sel").innerHTML = Object.keys(COUNTRIES).map((k) => `<option value="${k}">${esc(cLabel(k))}</option>`).join("");
  $("country-sel").value = st.country;
}
$("country-sel").addEventListener("change", (e) => {
  st.country = e.target.value;
  store.set("country", st.country);
  if (!isMY() && location.hash.startsWith("#/c/school")) location.hash = "#/";
  rerender();
});
$("country-chip").addEventListener("click", () => $("menu-btn").click());

function renderLangSeg() {
  $("lang-seg").innerHTML = Object.entries(LANGS).map(([k, label]) =>
    `<button data-lang="${k}" aria-pressed="${st.lang === k}">${label}</button>`).join("");
}

function applyLanguage() {
  setLang(st.lang);
  applyStatic();
  renderStateOptions();
  renderCountrySelect();
  renderLangSeg();
  renderAppearance();
  renderExportYears();
}

$("lang-seg").addEventListener("click", (e) => {
  const b = e.target.closest("[data-lang]");
  if (!b) return;
  st.lang = b.dataset.lang;
  store.set("lang", st.lang);
  applyLanguage();
  rerender();
});

// ---------- settings: appearance ----------
const darkMQ = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
function applyTheme() {
  const isDark = st.apMode === "dark" || (st.apMode === "system" && darkMQ?.matches);
  const el = document.documentElement;
  el.dataset.theme = isDark ? st.apDark : st.apLight;
  el.dataset.scheme = isDark ? "dark" : "light";
  const header = getComputedStyle(el).getPropertyValue("--header").trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", header || "#0d1660");
}
darkMQ?.addEventListener?.("change", () => { if (st.apMode === "system") applyTheme(); });

function swatches(themes, current, kind) {
  return themes.map((th) => `<button class="swatch" data-${kind}="${th}" aria-pressed="${th === current}">
      <span class="sw-prev" data-theme-preview="${th}"><span class="sw-card"><i></i><i></i></span></span>
      <span class="sw-name">${t(`th.${th}`)}</span>
    </button>`).join("");
}

function renderAppearance() {
  $("ap-mode").innerHTML = ["system", "light", "dark"].map((m) =>
    `<button data-mode="${m}" aria-pressed="${st.apMode === m}">${t(`ap.${m}`)}</button>`).join("");
  $("ap-light").innerHTML = swatches(LIGHT_THEMES, st.apLight, "light");
  $("ap-dark").innerHTML = swatches(DARK_THEMES, st.apDark, "dark");
}

$("menu").addEventListener("click", (e) => {
  const mode = e.target.closest("[data-mode]");
  const light = e.target.closest("[data-light]");
  const dark = e.target.closest("[data-dark]");
  if (mode) { st.apMode = mode.dataset.mode; store.set("apMode", st.apMode); }
  else if (light) { st.apLight = light.dataset.light; store.set("apLight", st.apLight); if (st.apMode === "dark") { st.apMode = "light"; store.set("apMode", "light"); } }
  else if (dark) { st.apDark = dark.dataset.dark; store.set("apDark", st.apDark); if (st.apMode === "light") { st.apMode = "dark"; store.set("apMode", "dark"); } }
  else return;
  applyTheme();
  renderAppearance();
});

// ---------- settings: share ----------
const shareUrl = () => `${location.origin}${location.pathname}`;
function renderShare() {
  const url = shareUrl();
  $("share-url").textContent = url.replace(/^https?:\/\//, "");
  try {
    const qr = window.qrcode(0, "M");
    qr.addData(url);
    qr.make();
    $("qr").innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  } catch { $("qr").textContent = ""; }
  $("sh-wa").href = `https://wa.me/?text=${encodeURIComponent(`${t("sh.text")}\n${url}`)}`;
  $("sh-native").hidden = !navigator.share;
}
$("sh-native").addEventListener("click", () => {
  navigator.share?.({ title: t("appTitle"), text: t("sh.text"), url: shareUrl() }).catch(() => {});
});
$("sh-copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(shareUrl()); }
  catch {
    const r = document.createRange(); r.selectNodeContents($("share-url"));
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); document.execCommand?.("copy");
  }
  toast(t("sh.copied"));
});

let toastTimer;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 1800);
}

$("menu-btn").addEventListener("click", () => {
  renderCountrySelect();
  renderLangSeg();
  renderAppearance();
  renderShare();
  $("menu").showModal();
});
$("sources").innerHTML = Object.keys(SOURCES).filter((k) => k !== "moe").map((k) => `<li>${srcLink(k, true)}</li>`).join("");

// ---------- phone calendar ----------
const EXPORT_YEARS = [...new Set([...OFFICIAL_YEARS, today.getFullYear(), today.getFullYear() + 1, today.getFullYear() + 2])].sort();
function renderExportYears() {
  const checked = new Set([...$("x-years").querySelectorAll("input:checked")].map((i) => Number(i.value)));
  const def = (y) => (checked.size ? checked.has(y) : y >= today.getFullYear() && y <= today.getFullYear() + 1);
  $("x-years").innerHTML = EXPORT_YEARS.map((y) =>
    `<label><input type="checkbox" value="${y}" ${def(y) ? "checked" : ""}> ${y}${isOfficial(y) ? "" : ` ${t("x.estimated")}`}</label>`).join("");
}

function feedUrl() {
  if (!isMY() || isAll()) return null;
  const online = /^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname);
  if (!online) return null;
  const base = location.pathname.replace(/[^/]*$/, "");
  const dir = getLang() === "en" ? "" : `${getLang()}/`;
  return `${location.host}${base}ics/${dir}${st.region}.ics`;
}

$("cal-btn").addEventListener("click", () => {
  $("x-state").textContent = isAll() ? t("x.pickState") : isMY() ? t("x.what", { s: sName(st.region) }) : `${cLabel(st.country)} · ${t("x.public")}`;
  $("x-download").disabled = isAll();
  const feed = feedUrl();
  $("x-webcal").href = feed ? `webcal://${feed}` : "#";
  $("x-google").href = feed ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(`webcal://${feed}`)}` : "#";
  for (const id of ["x-webcal", "x-google"]) $(id).setAttribute("aria-disabled", String(!feed));
  $("x-feed-note").textContent = isAll() ? t("x.pickState") : t(feed ? "x.feedOk" : "x.feedOff");
  $("export").showModal();
});

$("x-download").addEventListener("click", () => {
  const years = [...$("x-years").querySelectorAll("input:checked")].map((i) => Number(i.value));
  if (!years.length) return;
  const ics = buildICS({
    state: isMY() ? st.region : st.country, years,
    ...(isMY() ? {} : { provider: hol, placeName: cName(st.country) }),
    publicHolidays: $("x-public").checked, schoolHolidays: $("x-school").checked,
    events: $("x-mine").checked ? st.events : null,
  });
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `holidays-${isMY() ? `MY-${st.region}` : st.country}-${years.join("-")}.ics` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
});

// ---------- navigation & events ----------
$("years").addEventListener("click", (e) => {
  const b = e.target.closest("[data-year]");
  if (!b) return;
  st.year = Number(b.dataset.year);
  renderYears();
  renderMonths();
});
$("months").addEventListener("click", (e) => {
  const b = e.target.closest("[data-month]");
  if (b) location.hash = `#/m/${st.year}-${pad(Number(b.dataset.month) + 1)}`;
});
$("cats").addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]");
  if (b) location.hash = `#/c/${b.dataset.cat}/${st.year}`;
});

function stepMonth(delta) {
  const [, , a] = location.hash.split("/");
  const [y, m] = a.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  location.replace(`#/m/${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
}
$("m-prev").addEventListener("click", () => stepMonth(-1));
$("m-next").addEventListener("click", () => stepMonth(1));
$("m-grid").addEventListener("click", (e) => {
  const c = e.target.closest("[data-date]");
  if (c) openDay(c.dataset.date);
});
$("l-controls").addEventListener("change", (e) => {
  if (e.target.id !== "cmp-sel") return;
  st.cmp = e.target.value;
  store.set("cmp", st.cmp);
  route();
});
$("l-controls").addEventListener("click", (e) => {
  const scope = e.target.closest("[data-lw-scope]");
  const leave = e.target.closest("[data-lw-leave]");
  if (scope) { st.lwScope = scope.dataset.lwScope; store.set("lwScope", st.lwScope); }
  else if (leave) { st.lwLeave = Number(leave.dataset.lwLeave); store.set("lwLeave", st.lwLeave); }
  else return;
  route();
});
for (const id of ["m-list", "l-list"]) {
  $(id).addEventListener("click", (e) => {
    const li = e.target.closest("[data-date]");
    if (li) openDay(li.dataset.date);
  });
}
$("back").addEventListener("click", () => { location.hash = "#/"; });

$("state").addEventListener("change", (e) => {
  st.region = e.target.value;
  store.set("region", st.region);
  st.lwScope = "mine";
  store.set("lwScope", st.lwScope);
  rerender();
});

$("evt-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("evt-text").value.trim();
  if (!text || !st.day) return;
  (st.events[st.day] ||= []).push(text);
  store.set("events", st.events);
  $("evt-text").value = "";
  rerender();
});
$("d-list").addEventListener("click", (e) => {
  e.stopPropagation();
  const b = e.target.closest("[data-del]");
  if (!b) return;
  const list = st.events[st.day] || [];
  list.splice(Number(b.dataset.del), 1);
  if (!list.length) delete st.events[st.day];
  store.set("events", st.events);
  rerender();
});
for (const id of ["day", "menu", "export"]) {
  $(id).addEventListener("click", (e) => { if (e.target === $(id)) $(id).close(); });
}
document.addEventListener("keydown", (e) => {
  if ($("month").hidden || e.target.tagName === "INPUT" || document.querySelector("dialog[open]")) return;
  if (e.key === "ArrowLeft") stepMonth(-1);
  if (e.key === "ArrowRight") stepMonth(1);
});

window.addEventListener("hashchange", route);
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
applyTheme();
applyLanguage();
route();
