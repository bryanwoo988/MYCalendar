import { STATES, holidaysFor, isOfficial, OFFICIAL_YEARS, replacementNote, SOURCES, SCHOOL_YEARS,
  schoolHolidaysFor, schoolGroup, SALARY_DATES } from "./data.js";
import { lunar, hijri } from "./calendars.js";
import { buildICS } from "./ics.js";
import { longWeekends, statesSummary } from "./longweekend.js";

// Holidays are calculated for any year; offer last year through ten years ahead.
const YEARS = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - 1 + i);
const MONTH_LABEL = ["JAN", "FEB", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUG", "SEPT", "OCT", "NOV", "DEC"];
const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_ZH = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const WD_EN = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
const WD_ZH = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const WD_MS = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
const CATS = {
  public: "Public Holiday",
  school: "School Holiday",
  salary: "Salary Schedule",
  long: "Long Weekend",
};
const WD_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => new Date(s + "T00:00:00");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtShort = (s) => parse(s).toLocaleDateString("en-MY", { day: "numeric", month: "short", weekday: "short" });

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
  day: null,
};
let hol = holidaysFor(st.region);

// ---------- lookups ----------
function schoolOn(dateIso) {
  return schoolHolidaysFor(st.region).find((s) => dateIso >= s.start && dateIso <= s.end);
}
const srcLink = (key, full = false) => `<a href="${SOURCES[key].url}" target="_blank" rel="noopener">${esc(full ? SOURCES[key].label : SOURCES[key].short)}</a>`;
const SRC_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3v4h4M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const srcRow = (keys) => `<div class="src">${SRC_ICON}<span>Source: ${keys.map((k) => srcLink(k)).join(" · ")}</span></div>`;
const isPay = (dateIso) => SALARY_DATES.includes(dateIso);

function monthInfo(y, m) {
  const first = new Date(y, m, 1);
  const days = new Date(y, m + 1, 0).getDate();
  const offset = first.getDay();
  return { days, offset, weeks: Math.ceil((offset + days) / 7) };
}

// ---------- home ----------
function renderYears() {
  $("years").innerHTML = YEARS.map((y) =>
    `<button class="year" data-year="${y}" aria-current="${y === st.year}">${y}</button>`).join("");
  $("years").querySelector('[aria-current="true"]')?.scrollIntoView({ inline: "center", block: "nearest" });
}

function miniCalendar(y, m) {
  const { days, offset } = monthInfo(y, m);
  const rows = WD_EN.map((wd, dow) => {
    const cols = Array(6).fill("<span></span>");
    for (let d = 1; d <= days; d++) {
      if ((offset + d - 1) % 7 !== dow) continue;
      const key = `${y}-${pad(m + 1)}-${pad(d)}`;
      const red = dow === 0 || hol.has(key);
      cols[Math.floor((offset + d - 1) / 7)] = `<span class="${red ? "r" : ""}">${d}</span>`;
    }
    return `<div class="row"><span class="wd">${wd}</span>${cols.join("")}</div>`;
  });
  return `<div class="mini" aria-hidden="true"><div class="strip"></div>${rows.join("")}</div>`;
}

function renderMonths() {
  const nowKey = `${today.getFullYear()}-${today.getMonth()}`;
  $("months").innerHTML = MONTH_LABEL.map((label, m) => `
    <button class="thumb ${nowKey === `${st.year}-${m}` ? "now" : ""}" data-month="${m}" aria-label="${MONTH_FULL[m]} ${st.year}">
      ${miniCalendar(st.year, m)}
      <span class="label ${label.length > 4 ? "long" : ""}">${label}</span>
    </button>`).join("");
}

function renderHome() {
  renderYears();
  renderMonths();
}

// ---------- month page ----------
function itemsForDay(key) {
  const out = [];
  for (const h of hol.get(key) || []) out.push(holItem(h));
  const s = schoolOn(key);
  if (s) out.push({ type: "school", text: s.name });
  if (isPay(key)) out.push({ type: "salary", text: "Civil servant pay day" });
  (st.events[key] || []).forEach((e, i) => out.push({ type: "evt", text: e, idx: i }));
  return out;
}

function renderMonthPage(y, m) {
  const { days, offset, weeks } = monthInfo(y, m);
  const l1 = lunar(new Date(y, m, 1)), l2 = lunar(new Date(y, m, days));
  const h1 = hijri(new Date(y, m, 1)), h2 = hijri(new Date(y, m, days));
  $("m-title").innerHTML = `${MONTH_FULL[m]} ${y}<small>${MONTH_ZH[m]}</small>`;
  $("m-sub").textContent =
    `${l1.yearName}${l1.zodiac}年${l1.yearName === l2.yearName ? "" : ` – ${l2.yearName}${l2.zodiac}年`} · 农历${l1.month === l2.month ? l1.month : `${l1.month} – ${l2.month}`} · ` +
    `${h1.monthName}${h1.monthName === h2.monthName ? "" : ` – ${h2.monthName}`} ${h2.year}H`;

  const todayKey = iso(today);
  const rows = WD_EN.map((wd, dow) => {
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
      const hjLabel = hj.day === 1 ? hj.short : hj.day;
      cells[Math.floor((offset + d - 1) / 7)] = `
        <button class="${cls.join(" ")}" data-date="${key}" aria-label="${esc(`${d} ${MONTH_FULL[m]}, ${WD_MS[dow]}${hs.length ? ", " + hs.map((h) => h.name).join(", ") : ""}`)}">
          <span class="g">${d}</span>
          <span class="lu ${lu.day === 1 || lu.day === 15 ? "first" : ""}">${lu.label}</span>
          <span class="hj">${hjLabel}</span>
          ${hs.length ? `<span class="hn">${esc(hs[0].name)}</span>` : ""}
          ${isPay(key) ? '<span class="pay">$</span>' : ""}
          ${st.events[key]?.length ? '<span class="ev"></span>' : ""}
        </button>`;
    }
    return `<div class="trow ${dow === 0 ? "sun" : ""}" style="--weeks:${weeks}">
      <div class="wdl"><b>${WD_SHORT[dow]}</b><span>${WD_ZH[dow].slice(-1)} · ${WD_MS[dow]}</span></div>${cells.join("")}</div>`;
  });
  $("m-grid").innerHTML = rows.join("");

  const memo = [];
  for (let d = 1; d <= days; d++) {
    const key = `${y}-${pad(m + 1)}-${pad(d)}`;
    for (const it of itemsForDay(key)) {
      if (it.type === "school" && d > 1 && schoolOn(`${y}-${pad(m + 1)}-${pad(d - 1)}`)?.name === it.text) continue;
      memo.push(listItem(key, it));
    }
  }
  $("m-list").innerHTML = memo.join("") || '<li class="empty">Nothing this month.</li>';
}

const holItem = (h) => ({ type: "public", text: h.name, kind: h.kind, unc: h.uncertain, star: h.subjectToChange });

function tagFor(it) {
  if (it.type !== "public") return "";
  if (it.kind === "estimated") return `<span class="tag est">${it.unc ? "estimated ±1d" : "estimated"}</span>`;
  if (it.kind === "replacement") return '<span class="tag repl">replacement</span>';
  if (it.star) return '<span class="tag est">may change</span>';
  return "";
}

function listItem(key, it, when = fmtShort(key)) {
  return `<li class="item t-${it.type}" data-date="${key}">
    <span class="mark" aria-hidden="true"></span>
    <span class="body"><span class="what">${esc(it.text)}</span>${when ? `<span class="when">${when}</span>` : ""}</span>
    ${tagFor(it)}${it.type === "evt" && it.idx != null && !when ? `<button class="x" data-del="${it.idx}" aria-label="Delete">✕</button>` : ""}
  </li>`;
}

// ---------- category list ----------
function renderLong(y) {
  const c = $("l-controls");
  c.hidden = false;
  c.innerHTML = `
    <div class="seg" role="group" aria-label="States">
      <button data-lw-scope="mine" aria-pressed="${st.lwScope === "mine"}">${esc(STATES[st.region])}</button>
      <button data-lw-scope="all" aria-pressed="${st.lwScope === "all"}">All states</button>
    </div>
    <div class="seg" role="group" aria-label="Annual leave days">
      ${[0, 1, 2].map((n) => `<button data-lw-leave="${n}" aria-pressed="${st.lwLeave === n}">${n === 0 ? "No leave" : `+${n} leave`}</button>`).join("")}
    </div>
    <div class="lw-legend"><span class="chip weekend">Weekend</span><span class="chip holiday">Public Holiday</span><span class="chip leave">Annual Leave</span></div>`;

  const all = st.lwScope === "all";
  const list = longWeekends(y, all ? Object.keys(STATES) : [st.region], st.lwLeave);
  const notes = all ? ['<div class="pill-note">Showing every state. Pick your state to see only yours.</div>'] : [];
  if (!isOfficial(y)) notes.push('<div class="notice">Based on estimated holidays — not yet gazetted.</div>');
  const rn = all ? "" : replacementNote(st.region);
  if (rn) notes.push(`<div class="notice">${esc(rn)}</div>`);
  $("l-note").innerHTML = notes.join("");

  const rows = [];
  let lastM = -1;
  for (const w of list) {
    const m = parse(w.holidays[0].date).getMonth();
    if (m !== lastM) { rows.push(`<li class="mhead">${MONTH_FULL[m]}</li>`); lastM = m; }
    const title = [...new Set(w.holidays.map((h) => h.name.replace(/ \((replacement|2nd day|3rd day)\)$/, "")))].join(" / ");
    const chips = w.days.map((d, i) => {
      const dt = parse(d.date);
      const label = `${WD_SHORT[dt.getDay()]} ${dt.getDate()}${i > 0 && dt.getDate() === 1 ? ` ${MONTH_FULL[dt.getMonth()].slice(0, 3)}` : ""}`;
      return `<span class="chip ${d.type}">${label}</span>`;
    }).join("");
    const cards = w.holidays.map((h) => {
      const dt = parse(h.date);
      return `<button class="hcard" data-date="${h.date}">
        <span class="dbox"><small>${WD_SHORT[dt.getDay()]}</small><b>${dt.getDate()}</b></span>
        <span><span class="hname">${esc(h.name)}</span>${all ? `<br><span class="hstates">${esc(statesSummary(h.states))}</span>` : ""}</span>
      </button>`;
    }).join("");
    rows.push(`<li class="lw">
      <h3>${esc(title)}</h3>
      <div class="meta"><span class="days">${w.days.length} days off</span><span>${w.leave ? `${w.leave} day${w.leave > 1 ? "s" : ""} leave` : "No leave needed"}</span>${w.estimated ? '<span class="tag est">estimated</span>' : ""}</div>
      <div class="chips">${chips}</div>
      ${cards}
    </li>`);
  }
  $("l-list").innerHTML = rows.join("") || '<li class="empty">No long weekends found.</li>';
}

function renderList(cat, y) {
  $("l-controls").hidden = true;
  if (cat === "long") return renderLong(y);
  const rows = [];
  let note = "";
  if (cat === "public") {
    const parts = [];
    if (isOfficial(y)) {
      const keys = [`hka${y}`];
      if (hol.list(y).some((h) => h.kind === "replacement")) keys.push("act369");
      if (y === 2026 && st.region === "SWK") keys.push("swk202");
      parts.push(srcRow(keys));
    } else {
      parts.push(`<div class="notice">Not yet gazetted. Estimated from the rules in the official ${OFFICIAL_YEARS.join(" & ")} lists — for planning only.</div>`);
    }
    const rn = replacementNote(st.region);
    if (rn) parts.push(`<div class="notice">${esc(rn)}</div>`);
    note = parts.join("");
    const yearMap = hol.year(y);
    const keys = [...yearMap.keys()].sort();
    let lastM = -1;
    for (const k of keys) {
      const m = parse(k).getMonth();
      if (m !== lastM) { rows.push(`<li class="mhead">${MONTH_FULL[m]}</li>`); lastM = m; }
      for (const h of yearMap.get(k)) rows.push(listItem(k, holItem(h)));
    }
  } else if (cat === "school") {
    const g = schoolGroup(st.region);
    const items = schoolHolidaysFor(st.region).filter((s) => s.start.startsWith(`${y}-`));
    note = `<div class="pill-note">Group ${g} · ${g === "A" ? "Kedah, Kelantan, Terengganu" : "all other states & Federal Territories"}</div>`;
    if (SCHOOL_YEARS[y]) note += srcRow([SCHOOL_YEARS[y], ...(items.some((s) => s.source === "kpm2025") ? ["kpm2025"] : [])]);
    for (const s of items) {
      const days = Math.round((parse(s.end) - parse(s.start)) / 864e5) + 1;
      const when = s.start === s.end ? fmtShort(s.start) : `${fmtShort(s.start)} – ${fmtShort(s.end)}`;
      rows.push(listItem(s.start, { type: "school", text: s.name }, `${when}${days > 1 ? ` · ${days} days` : ""}`));
    }
  } else {
    note = '<div class="notice">Federal civil servants (JANM). From secondary summaries of JANM circulars, not the circular itself. Private-sector pay dates depend on your employer.</div>';
    for (const d of SALARY_DATES.filter((d) => d.startsWith(`${y}-`))) {
      rows.push(listItem(d, { type: "salary", text: `${MONTH_FULL[parse(d).getMonth()]} salary` }));
    }
  }
  $("l-note").innerHTML = note;
  const notYet = cat === "school"
    ? `No official KPM school calendar for ${y} in this app yet. Check ${srcLink("moe")}.`
    : `JANM has not announced the ${y} pay dates yet (usually published around September–October ${y - 1}).`;
  $("l-list").innerHTML = rows.join("") || `<li class="empty">${notYet}</li>`;
}

// ---------- day sheet ----------
function openDay(key) {
  st.day = key;
  const date = parse(key);
  const lu = lunar(date), hj = hijri(date);
  $("d-title").textContent = date.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("d-sub").textContent = `农历 ${lu.month}${lu.day === 1 ? "初一" : lu.label} · ${hj.day} ${hj.monthName} ${hj.year}H`;
  const items = itemsForDay(key).map((it) => listItem(key, it, ""));
  $("d-list").innerHTML = items.join("") || '<li class="empty">Nothing on this day.</li>';
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
    $("bar-title").textContent = `${MONTH_FULL[m - 1]} ${y}`;
    show = "month";
  } else if (kind === "c" && CATS[a]) {
    const y = Number(b) || st.year;
    renderList(a, y);
    $("bar-title").textContent = `${CATS[a]} ${y}`;
    show = "list";
  } else {
    renderHome();
    $("bar-title").textContent = "MY Calendar · 马来西亚";
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

// ---------- events ----------
$("years").addEventListener("click", (e) => {
  const b = e.target.closest("[data-year]");
  if (!b) return;
  st.year = Number(b.dataset.year);
  renderHome();
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
$("back").addEventListener("click", () => {
  location.hash = "#/";
});

$("menu-btn").addEventListener("click", () => $("menu").showModal());
$("sources").innerHTML = Object.keys(SOURCES).filter((k) => k !== "moe").map((k) => `<li>${srcLink(k, true)}</li>`).join("");

// ---------- phone calendar ----------
const EXPORT_YEARS = [...new Set([...OFFICIAL_YEARS, today.getFullYear(), today.getFullYear() + 1, today.getFullYear() + 2])].sort();
$("x-years").innerHTML = EXPORT_YEARS.map((y) =>
  `<label><input type="checkbox" value="${y}" ${y >= today.getFullYear() && y <= today.getFullYear() + 1 ? "checked" : ""}> ${y}${isOfficial(y) ? "" : " (estimated)"}</label>`).join("");

function feedUrl() {
  const online = /^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname);
  if (!online) return null;
  const base = location.pathname.replace(/[^/]*$/, "");
  return `${location.host}${base}ics/${st.region}.ics`;
}

function openExport() {
  $("x-state").textContent = `${STATES[st.region]} · public holidays + school holidays`;
  const feed = feedUrl();
  $("x-webcal").href = feed ? `webcal://${feed}` : "#";
  $("x-google").href = feed ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(`webcal://${feed}`)}` : "#";
  for (const id of ["x-webcal", "x-google"]) $(id).setAttribute("aria-disabled", String(!feed));
  $("x-feed-note").textContent = feed
    ? "Change state first if you want another state's feed."
    : "Subscription links work once the app is published online (for example on GitHub Pages). Download a file for now.";
  $("export").showModal();
}
$("cal-btn").addEventListener("click", openExport);

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
$("state").innerHTML = Object.entries(STATES).map(([c, n]) => `<option value="${c}">${n}</option>`).join("");
$("state").value = st.region;
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
route();
