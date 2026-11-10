import { STATES, holidaysFor, isOfficial, OFFICIAL_YEARS, replacementNote, SOURCES, SCHOOL_YEARS,
  schoolHolidaysFor, schoolGroup, FRI_SAT } from "./data.js";
import { lunar, hijri } from "./calendars.js";
import { buildICS } from "./ics.js";
import { longWeekends } from "./longweekend.js";
import { t, setLang, getLang, applyStatic, LANGS, MONTHS, MONTH_TILE, WEEKDAYS, LOCALE,
  holidayName, schoolName, stateName } from "./i18n.js";

// Holidays are calculated for any year; offer last year through ten years ahead.
const YEARS = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - 1 + i);
const CATS = ["public", "school", "long"];
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
const sName = (code) => stateName(code, STATES[code]);

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
  day: null,
};
setLang(st.lang);
let hol = holidaysFor(st.region);

function guessLang() {
  const l = (navigator.language || "").toLowerCase();
  return l.startsWith("zh") ? "zh" : l.startsWith("ms") || l.startsWith("id") ? "ms" : "en";
}

// ---------- lookups ----------
const schoolOn = (dateIso) => schoolHolidaysFor(st.region).find((s) => dateIso >= s.start && dateIso <= s.end);
const srcLink = (key, full = false) => `<a href="${SOURCES[key].url}" target="_blank" rel="noopener">${esc(full ? SOURCES[key].label : SOURCES[key].short)}</a>`;
const SRC_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3v4h4M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
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
      cols[Math.floor((offset + d - 1) / 7)] = `<span class="${dow === 0 || hol.has(key) ? "r" : ""}">${d}</span>`;
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
const holItem = (h) => ({ type: "public", text: holidayName(h.name), kind: h.kind, unc: h.uncertain, star: h.subjectToChange });

function itemsForDay(key) {
  const out = (hol.get(key) || []).map(holItem);
  const s = schoolOn(key);
  if (s) out.push({ type: "school", text: schoolName(s.name), raw: s.name });
  (st.events[key] || []).forEach((e, i) => out.push({ type: "evt", text: e, idx: i }));
  return out;
}

function tagFor(it) {
  if (it.type !== "public") return "";
  if (it.kind === "estimated") return `<span class="tag est">${t(it.unc ? "tag.estUnc" : "tag.est")}</span>`;
  if (it.kind === "replacement") return `<span class="tag repl">${t("tag.repl")}</span>`;
  if (it.star) return `<span class="tag est">${t("tag.change")}</span>`;
  return "";
}

function listItem(key, it, when = fmtShort(key)) {
  return `<li class="item t-${it.type}" data-date="${key}">
    <span class="mark" aria-hidden="true"></span>
    <span class="body"><span class="what">${esc(it.text)}</span>${when ? `<span class="when">${when}</span>` : ""}</span>
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
      const hs = hol.get(key) || [];
      const cls = ["cell"];
      if (dow === 0 || hs.length) cls.push("red");
      if (hs.length) cls.push("hol");
      if (schoolOn(key)) cls.push("school");
      if (key === todayKey) cls.push("today");
      cells[Math.floor((offset + d - 1) / 7)] = `
        <button class="${cls.join(" ")}" data-date="${key}" aria-label="${esc(`${fmtShort(key)}${hs.length ? ", " + hs.map((h) => holidayName(h.name)).join(", ") : ""}`)}">
          <span class="g">${d}</span>
          <span class="lu ${lu.day === 1 || lu.day === 15 ? "first" : ""}">${lu.label}</span>
          <span class="hj">${hj.day === 1 ? hj.short : hj.day}</span>
          ${hs.length ? `<span class="hn">${esc(holidayName(hs[0].name))}</span>` : ""}
          ${st.events[key]?.length ? '<span class="ev"></span>' : ""}
        </button>`;
    }
    const sub = getLang() === "zh" ? `周${WD_ZH[dow]}` : getLang() === "ms" ? WD_ZH[dow] : `${WD_ZH[dow]} · ${WD_MS[dow]}`;
    return `<div class="trow ${dow === 0 ? "sun" : ""}" style="--weeks:${weeks}">
      <div class="wdl"><b>${getLang() === "zh" ? WEEKDAYS.en[dow] : wd(dow)}</b><span>${sub}</span></div>${cells.join("")}</div>`;
  });
  $("m-grid").innerHTML = rows.join("");

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
  if (codes.length === Object.keys(STATES).length) return t("lw.allStatesShort");
  const names = codes.map((c) => sName(c).replace(/^W\.P\. /, ""));
  const sep = getLang() === "zh" ? "、" : ", ";
  const list = names.length > 3 ? `${names.slice(0, 3).join(sep)} ${t("lw.more", { n: names.length - 3 })}` : names.join(sep);
  return t("lw.only", { list });
}

function renderLong(y) {
  const c = $("l-controls");
  c.hidden = false;
  c.innerHTML = `
    <div class="seg" role="group">
      <button data-lw-scope="mine" aria-pressed="${st.lwScope === "mine"}">${esc(sName(st.region))}</button>
      <button data-lw-scope="all" aria-pressed="${st.lwScope === "all"}">${t("lw.allStates")}</button>
    </div>
    <div class="seg" role="group">
      ${[0, 1, 2].map((n) => `<button data-lw-leave="${n}" aria-pressed="${st.lwLeave === n}">${n === 0 ? t("lw.noLeave") : t("lw.plusLeave", { n })}</button>`).join("")}
    </div>
    <div class="lw-legend"><span class="chip weekend">${t("lw.weekend")}</span><span class="chip holiday">${t("lw.holiday")}</span><span class="chip leave">${t("lw.leave")}</span></div>`;

  const all = st.lwScope === "all";
  const list = longWeekends(y, all ? Object.keys(STATES) : [st.region], st.lwLeave);
  const notes = all ? [`<div class="pill-note">${t("lw.showingAll")}</div>`] : [];
  if (!isOfficial(y)) notes.push(`<div class="notice">${t("lw.estimated")}</div>`);
  if (!all) notes.push(replNotice());
  $("l-note").innerHTML = notes.join("");

  const rows = [];
  let lastM = -1;
  for (const w of list) {
    const m = parse(w.holidays[0].date).getMonth();
    if (m !== lastM) { rows.push(`<li class="mhead">${monthName(m)}</li>`); lastM = m; }
    const title = [...new Set(w.holidays.map((h) => holidayName(h.name.replace(/ \((replacement|2nd day|3rd day)\)$/, ""))))].join(" / ");
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
        <span><span class="hname">${esc(holidayName(h.name))}</span>${all ? `<br><span class="hstates">${esc(statesSummary(h.states))}</span>` : ""}</span>
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
  if (!replacementNote(st.region)) return "";
  return `<div class="notice">${esc(FRI_SAT.includes(st.region) ? t("replFriSat") : t("replOther", { s: sName(st.region) }))}</div>`;
}

function renderList(cat, y) {
  $("l-controls").hidden = true;
  if (cat === "long") return renderLong(y);
  const rows = [];
  let note = "";
  if (cat === "public") {
    if (isOfficial(y)) {
      const keys = [`hka${y}`];
      if (hol.list(y).some((h) => h.kind === "replacement")) keys.push("act369");
      if (y === 2026 && st.region === "SWK") keys.push("swk202");
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
    const g = schoolGroup(st.region);
    const items = schoolHolidaysFor(st.region).filter((s) => s.start.startsWith(`${y}-`));
    note = `<div class="pill-note">${t(g === "A" ? "groupA" : "groupB")}</div>`;
    if (SCHOOL_YEARS[y]) note += srcRow([SCHOOL_YEARS[y], ...(items.some((s) => s.source === "kpm2025") ? ["kpm2025"] : [])]);
    for (const s of items) {
      const n = Math.round((parse(s.end) - parse(s.start)) / 864e5) + 1;
      const when = s.start === s.end ? fmtShort(s.start) : `${fmtShort(s.start)} – ${fmtShort(s.end)}`;
      rows.push(listItem(s.start, { type: "school", text: schoolName(s.name) }, `${when}${n > 1 ? ` · ${t("days", { n })}` : ""}`));
    }
  }
  $("l-note").innerHTML = note;
  const notYet = `${t("noSchool", { y })} ${srcLink("moe")}.`;
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
    $("bar-title").textContent = t("appTitle");
  }
  for (const [k, el] of Object.entries(views)) el.hidden = k !== show;
  $("back").hidden = show === "home";
  window.scrollTo(0, 0);
}

function rerender() {
  hol = holidaysFor(st.region);
  route();
  if ($("day").open && st.day) openDay(st.day);
}

// ---------- settings: language ----------
function renderStateOptions() {
  $("state").innerHTML = Object.keys(STATES).map((c) => `<option value="${c}">${esc(sName(c))}</option>`).join("");
  $("state").value = st.region;
}

function renderLangSeg() {
  $("lang-seg").innerHTML = Object.entries(LANGS).map(([k, label]) =>
    `<button data-lang="${k}" aria-pressed="${st.lang === k}">${label}</button>`).join("");
}

function applyLanguage() {
  setLang(st.lang);
  applyStatic();
  renderStateOptions();
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
  const online = /^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname);
  if (!online) return null;
  const base = location.pathname.replace(/[^/]*$/, "");
  const dir = getLang() === "en" ? "" : `${getLang()}/`;
  return `${location.host}${base}ics/${dir}${st.region}.ics`;
}

$("cal-btn").addEventListener("click", () => {
  $("x-state").textContent = t("x.what", { s: sName(st.region) });
  const feed = feedUrl();
  $("x-webcal").href = feed ? `webcal://${feed}` : "#";
  $("x-google").href = feed ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(`webcal://${feed}`)}` : "#";
  for (const id of ["x-webcal", "x-google"]) $(id).setAttribute("aria-disabled", String(!feed));
  $("x-feed-note").textContent = t(feed ? "x.feedOk" : "x.feedOff");
  $("export").showModal();
});

$("x-download").addEventListener("click", () => {
  const years = [...$("x-years").querySelectorAll("input:checked")].map((i) => Number(i.value));
  if (!years.length) return;
  const ics = buildICS({
    state: st.region, years,
    publicHolidays: $("x-public").checked, schoolHolidays: $("x-school").checked,
    events: $("x-mine").checked ? st.events : null,
  });
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `malaysia-holidays-${st.region}-${years.join("-")}.ics` });
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
