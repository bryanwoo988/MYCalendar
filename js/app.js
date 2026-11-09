import { STATES, holidaysFor } from "./holidays.js";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const FRI_SAT_WEEKEND = new Set(["KDH", "KTN", "TRG"]);
const $ = (id) => document.getElementById(id);

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  },
};

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const now = new Date();
const state = {
  region: store.get("region", "KUL"),
  year: now.getFullYear(),
  month: now.getMonth(),
  selected: iso(now),
  events: store.get("events", {}), // { "YYYY-MM-DD": ["text", ...] }
};
let holidays = holidaysFor(state.region);

function isWeekend(date) {
  const d = date.getDay();
  return FRI_SAT_WEEKEND.has(state.region) ? d === 5 || d === 6 : d === 0 || d === 6;
}

function renderStateSelect() {
  const sel = $("state");
  sel.innerHTML = Object.entries(STATES)
    .map(([code, name]) => `<option value="${code}">${name}</option>`).join("");
  sel.value = state.region;
  sel.addEventListener("change", () => {
    state.region = sel.value;
    store.set("region", state.region);
    holidays = holidaysFor(state.region);
    render();
  });
}

function renderGrid() {
  $("title").textContent = `${MONTHS[state.month]} ${state.year}`;
  const first = new Date(state.year, state.month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const todayIso = iso(new Date());
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = iso(d);
    const hs = holidays.get(key) || [];
    const evts = state.events[key] || [];
    const cls = ["day"];
    if (d.getMonth() !== state.month) cls.push("out");
    if (isWeekend(d)) cls.push("weekend");
    if (hs.length) cls.push(hs.every((h) => h.provisional) ? "prov" : "hol");
    if (key === todayIso) cls.push("today");
    if (key === state.selected) cls.push("sel");
    const label = [d.toDateString(), ...hs.map((h) => h.name), ...evts].join(", ");
    cells.push(
      `<button class="${cls.join(" ")}" data-date="${key}" role="gridcell" aria-label="${esc(label)}">
        <span class="n">${d.getDate()}</span>
        ${hs.map((h) => `<span class="t">${esc(h.name)}</span>`).join("")}
        ${evts.length ? '<span class="e"></span>' : ""}
      </button>`
    );
  }
  $("days").innerHTML = cells.join("");
}

function renderSelected() {
  const d = new Date(state.selected + "T00:00:00");
  $("sel-title").textContent = d.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hs = holidays.get(state.selected) || [];
  const evts = state.events[state.selected] || [];
  const items = [
    ...hs.map((h) => `<li><span>🇲🇾 ${esc(h.name)}</span>${h.provisional ? '<span class="tag">provisional</span>' : ""}</li>`),
    ...evts.map((e, i) => `<li><span>• ${esc(e)}</span><button class="x" data-del="${i}" aria-label="Delete event">✕</button></li>`),
  ];
  $("sel-list").innerHTML = items.join("") || '<li class="empty">Nothing on this day.</li>';
}

function renderMonthList() {
  const prefix = `${state.year}-${pad(state.month + 1)}-`;
  const rows = [...holidays.entries()]
    .filter(([date]) => date.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([date, hs]) => hs.map((h) => {
      const d = new Date(date + "T00:00:00");
      const dl = d.toLocaleDateString("en-MY", { day: "numeric", weekday: "short" });
      return `<li><span class="d">${dl}</span><span>${esc(h.name)}</span>${h.provisional ? '<span class="tag">provisional</span>' : ""}</li>`;
    }));
  $("month-list").innerHTML = rows.join("") || '<li class="empty">No public holidays (or no data for this year).</li>';
}

function render() {
  renderGrid();
  renderSelected();
  renderMonthList();
}

function shiftMonth(delta) {
  const d = new Date(state.year, state.month + delta, 1);
  state.year = d.getFullYear();
  state.month = d.getMonth();
  render();
}

$("prev").addEventListener("click", () => shiftMonth(-1));
$("next").addEventListener("click", () => shiftMonth(1));
$("today").addEventListener("click", () => {
  const t = new Date();
  state.year = t.getFullYear(); state.month = t.getMonth(); state.selected = iso(t);
  render();
});
$("days").addEventListener("click", (e) => {
  const cell = e.target.closest("[data-date]");
  if (!cell) return;
  state.selected = cell.dataset.date;
  const d = new Date(state.selected + "T00:00:00");
  if (d.getMonth() !== state.month) { state.year = d.getFullYear(); state.month = d.getMonth(); }
  render();
});
$("sel-list").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;
  const list = state.events[state.selected] || [];
  list.splice(Number(btn.dataset.del), 1);
  if (!list.length) delete state.events[state.selected];
  store.set("events", state.events);
  render();
});
$("evt-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("evt-text").value.trim();
  if (!text) return;
  (state.events[state.selected] ||= []).push(text);
  store.set("events", state.events);
  $("evt-text").value = "";
  render();
});
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (e.key === "ArrowLeft") shiftMonth(-1);
  if (e.key === "ArrowRight") shiftMonth(1);
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

renderStateSelect();
render();
