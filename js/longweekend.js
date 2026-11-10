// Long weekends: runs of days off around public holidays, optionally bridged with annual leave.
// Works for any "calendar": a holiday provider (get(date) → entries) plus its weekend days.
import { FRI_SAT, holidaysFor } from "./data.js";

const DAY = 864e5;
const isoUTC = (t) => new Date(t).toISOString().slice(0, 10);
const MIN_DAYS = 3;   // a "long weekend" is at least 3 consecutive days off
const REACH = 9;      // how far (days) to look either side of a holiday

// Malaysian state → calendar
export const stateCalendar = (state) => ({ hol: holidaysFor(state), weekend: FRI_SAT.includes(state) ? [5, 6] : [0, 6] });

function dayTable({ hol, weekend }, y) {
  const days = [];
  for (let t = Date.UTC(y - 1, 11, 1); t <= Date.UTC(y + 1, 0, 31); t += DAY) {
    const date = isoUTC(t);
    const entries = hol.get(date) || [];
    const hs = entries.filter((h) => h.kind !== "workday" && h.kind !== "unconfirmed" && h.kind !== "regional");
    const forcedWork = entries.some((h) => h.kind === "workday"); // e.g. China's make-up working Saturday
    const isWeekend = weekend.includes(new Date(t).getUTCDay());
    const type = hs.length ? "holiday" : forcedWork ? "work" : isWeekend ? "weekend" : "work";
    days.push({ date, hs, type, isWeekend: isWeekend && !forcedWork });
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

function windowsFor(cal, y, maxLeave) {
  const days = dayTable(cal, y);
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
 * @param {string[]} keys      calendar keys (e.g. Malaysian state codes)
 * @param {number} maxLeave    annual-leave days allowed to bridge gaps (0–2)
 * @param {(key: string) => {hol, weekend}} [calendarOf]  defaults to Malaysian states
 * @returns grouped long weekends; identical windows across keys are merged
 */
export function longWeekends(y, keys, maxLeave = 1, calendarOf = stateCalendar) {
  const groups = new Map();
  for (const key of keys) {
    for (const w of windowsFor(calendarOf(key), y, maxLeave)) {
      const id = w.days.map((d) => `${d.date}:${d.type}`).join("|");
      if (!groups.has(id)) groups.set(id, { ...w, states: [], holidays: new Map() });
      const g = groups.get(id);
      g.states.push(key);
      for (const d of w.days) {
        for (const h of d.hs) {
          const hk = `${d.date}|${h.name}`;
          if (!g.holidays.has(hk)) g.holidays.set(hk, { ...h, date: d.date, states: [] });
          g.holidays.get(hk).states.push(key);
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
