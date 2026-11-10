// Long weekends: runs of days off around public holidays, optionally bridged with annual leave.
import { STATES, FRI_SAT, holidaysFor } from "./data.js";

const DAY = 864e5;
const isoUTC = (t) => new Date(t).toISOString().slice(0, 10);
const MIN_DAYS = 3;   // a "long weekend" is at least 3 consecutive days off
const REACH = 9;      // how far (days) to look either side of a holiday

function dayTable(state, y) {
  const hol = holidaysFor(state);
  const weekend = FRI_SAT.includes(state) ? [5, 6] : [0, 6];
  const days = [];
  for (let t = Date.UTC(y - 1, 11, 1); t <= Date.UTC(y + 1, 0, 31); t += DAY) {
    const date = isoUTC(t);
    const hs = hol.get(date) || [];
    const isWeekend = weekend.includes(new Date(t).getUTCDay());
    days.push({ date, hs, type: hs.length ? "holiday" : isWeekend ? "weekend" : "work", isWeekend });
  }
  return days;
}

// Best window around holiday index h: maximise length, then minimise leave days.
function bestWindow(days, h, maxLeave) {
  let best = null;
  for (let a = h; a >= Math.max(0, h - REACH); a--) {
    if (days[a].type === "work") continue;
    for (let b = h; b <= Math.min(days.length - 1, h + REACH); b++) {
      if (days[b].type === "work") continue;
      let leave = 0;
      for (let i = a; i <= b; i++) if (days[i].type === "work") leave++;
      if (leave > maxLeave) break;
      const len = b - a + 1;
      if (!best || len > best.len || (len === best.len && leave < best.leave)) best = { a, b, len, leave };
    }
  }
  return best;
}

function windowsForState(state, y, maxLeave) {
  const days = dayTable(state, y);
  const seen = new Map();
  days.forEach((d, h) => {
    // Only holidays that take a working day off create a longer break.
    if (d.type !== "holiday" || d.isWeekend || !d.date.startsWith(`${y}-`)) return;
    const w = bestWindow(days, h, maxLeave);
    if (!w || w.len < MIN_DAYS) return;
    const key = `${w.a}-${w.b}`;
    if (!seen.has(key)) seen.set(key, w);
  });
  return [...seen.values()].map((w) => ({
    leave: w.leave,
    days: days.slice(w.a, w.b + 1).map((d) => ({ date: d.date, type: d.type === "work" ? "leave" : d.type, hs: d.hs })),
  }));
}

/**
 * @param {number} y
 * @param {string[]} states  state codes (one for "my state", all for "all states")
 * @param {number} maxLeave  annual-leave days allowed to bridge gaps (0–2)
 * @returns grouped long weekends; identical windows across states are merged
 */
export function longWeekends(y, states, maxLeave = 1) {
  const groups = new Map();
  for (const state of states) {
    for (const w of windowsForState(state, y, maxLeave)) {
      const key = w.days.map((d) => `${d.date}:${d.type}`).join("|");
      if (!groups.has(key)) groups.set(key, { ...w, states: [], holidays: new Map() });
      const g = groups.get(key);
      g.states.push(state);
      for (const d of w.days) {
        for (const h of d.hs) {
          const hk = `${d.date}|${h.name}`;
          if (!g.holidays.has(hk)) g.holidays.set(hk, { date: d.date, name: h.name, kind: h.kind, states: [] });
          g.holidays.get(hk).states.push(state);
        }
      }
    }
  }
  return [...groups.values()]
    .map((g) => ({
      days: g.days, leave: g.leave, states: g.states,
      estimated: g.days.some((d) => d.hs.some((h) => h.kind === "estimated")),
      holidays: [...g.holidays.values()].sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => a.days[0].date.localeCompare(b.days[0].date) || b.days.length - a.days.length);
}

// "Kuala Lumpur, Labuan, Melaka +8 only" style summary.
export function statesSummary(codes, total = Object.keys(STATES).length) {
  if (codes.length === total) return "All states";
  const names = codes.map((c) => STATES[c].replace(/^W\.P\. /, ""));
  return names.length > 3 ? `${names.slice(0, 3).join(", ")} +${names.length - 3} only` : `${names.join(", ")} only`;
}
