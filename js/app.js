import { STATES, holidaysFor, isGazetted, SCHOOL_HOLIDAYS, schoolGroup, SALARY_DATES } from "./data.js";
import { lunar, hijri } from "./calendars.js";

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
};

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
  day: null,
};
let hol = holidaysFor(st.region);

// ---------- lookups ----------
function schoolOn(dateIso) {
  const g = schoolGroup(st.region);
  return SCHOOL_HOLIDAYS.find((s) => s.group === g && dateIso >= s.start && dateIso <= s.end);
}
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
  for (const h of hol.get(key) || []) out.push({ type: "public", text: h.name, prov: h.provisional, unc: h.uncertain });
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
      <div class="wdl"><b>${wd}</b><span>${WD_ZH[dow]}</span><span>${WD_MS[dow]}</span></div>${cells.join("")}</div>`;
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

function listItem(key, it, when = fmtShort(key)) {
  const tag = it.type === "evt" ? '<span class="tag evt">mine</span>'
    : `<span class="tag ${it.prov ? "prov" : it.type}">${it.unc ? "±1 day" : it.prov ? "calculated" : it.type === "public" ? "holiday" : it.type === "school" ? "school" : "pay"}</span>`;
  return `<li data-date="${key}"><span class="when">${when}</span><span class="what">${esc(it.text)}</span>${tag}</li>`;
}

// ---------- category list ----------
function renderList(cat, y) {
  const rows = [];
  let note = "";
  if (cat === "public") {
    note = `${STATES[st.region]} · change state in ⋮ settings. ` + (isGazetted(y)
      ? "Gazetted list."
      : "Calculated from the official rules (lunar, Hijri and Tamil calendars + replacement-day rules). Islamic dates follow moon sighting; \"±1 day\" marks borderline crescents. Confirm with the gazette when it is published.");
    const yearMap = hol.year(y);
    const keys = [...yearMap.keys()].sort();
    let lastM = -1;
    for (const k of keys) {
      const m = parse(k).getMonth();
      if (m !== lastM) { rows.push(`<li class="mhead">${MONTH_FULL[m]}</li>`); lastM = m; }
      for (const h of yearMap.get(k)) rows.push(listItem(k, { type: "public", text: h.name, prov: h.provisional, unc: h.uncertain }));
    }
  } else if (cat === "school") {
    const g = schoolGroup(st.region);
    note = `Group ${g} (${g === "A" ? "Kedah, Kelantan, Terengganu" : "all other states"}) · KPM festive add-on days not included.`;
    for (const s of SCHOOL_HOLIDAYS.filter((s) => s.group === g && s.start.startsWith(`${y}-`))) {
      const days = Math.round((parse(s.end) - parse(s.start)) / 864e5) + 1;
      rows.push(listItem(s.start, { type: "school", text: `${s.name} · ${days} days` }, `${fmtShort(s.start)} – ${fmtShort(s.end)}`));
    }
  } else {
    note = "Federal civil servants (JANM). Private-sector pay dates depend on your employer.";
    for (const d of SALARY_DATES.filter((d) => d.startsWith(`${y}-`))) {
      rows.push(listItem(d, { type: "salary", text: `${MONTH_FULL[parse(d).getMonth()]} salary` }));
    }
  }
  $("l-note").textContent = note;
  const notYet = cat === "school"
    ? `KPM has not announced the ${y} school calendar yet (usually published in the second half of ${y - 1}).`
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
  const items = itemsForDay(key).map((it) => it.type === "evt"
    ? `<li><span class="what">${esc(it.text)}</span><span class="tag evt">mine</span><button class="x" data-del="${it.idx}" aria-label="Delete">✕</button></li>`
    : listItem(key, it, "").replace('<span class="when"></span>', ""));
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
$("cats").addEventListener("scroll", () => {
  const el = $("cats");
  const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
  const dots = $("dots").children;
  dots[0].classList.toggle("on", !atEnd);
  dots[1].classList.toggle("on", atEnd);
}, { passive: true });
$("dots").children[0].classList.add("on");

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
$("state").innerHTML = Object.entries(STATES).map(([c, n]) => `<option value="${c}">${n}</option>`).join("");
$("state").value = st.region;
$("state").addEventListener("change", (e) => {
  st.region = e.target.value;
  store.set("region", st.region);
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
  const b = e.target.closest("[data-del]");
  if (!b) return;
  const list = st.events[st.day] || [];
  list.splice(Number(b.dataset.del), 1);
  if (!list.length) delete st.events[st.day];
  store.set("events", st.events);
  rerender();
});
for (const id of ["day", "menu"]) {
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
