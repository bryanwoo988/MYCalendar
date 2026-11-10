// iCalendar (RFC 5545) export: all-day events that phone calendar apps can import or subscribe to.
import { STATES, holidaysFor, schoolHolidaysFor, isOfficial, SOURCES } from "./data.js";

const DAY = 864e5;
const compact = (iso) => iso.replaceAll("-", "");
const nextDay = (iso) => new Date(Date.parse(iso + "T00:00Z") + DAY).toISOString().slice(0, 10);
const escapeText = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// Fold lines longer than 75 octets (RFC 5545 §3.1).
function fold(line) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out = [];
  let cur = "", len = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (len + n > (out.length ? 74 : 75)) { out.push(cur); cur = ""; len = 0; }
    cur += ch; len += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

function event({ uid, start, end, summary, description, stamp }) {
  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(start)}`,
    `DTEND;VALUE=DATE:${compact(nextDay(end))}`,
    `SUMMARY:${escapeText(summary)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : null,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ].filter(Boolean);
}

/**
 * @param {object} o
 * @param {string} o.state      state code
 * @param {number[]} o.years
 * @param {boolean} [o.publicHolidays=true]
 * @param {boolean} [o.schoolHolidays=true]
 * @param {Object<string,string[]>} [o.events]  personal events by date
 */
export function buildICS({ state, years, publicHolidays = true, schoolHolidays = true, events = null, now = new Date() }) {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MY Calendar//Malaysia Holidays//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`Malaysia holidays · ${STATES[state]}`)}`,
    "X-WR-TIMEZONE:Asia/Kuala_Lumpur",
    "REFRESH-INTERVAL;VALUE=DURATION:P7D",
    "X-PUBLISHED-TTL:P7D",
  ];
  const hol = holidaysFor(state);
  for (const y of years) {
    if (publicHolidays) {
      for (const h of hol.list(y)) {
        const flags = [h.kind === "estimated" && "estimated", h.uncertain && "±1 day", h.subjectToChange && "subject to change"].filter(Boolean);
        const src = h.source ? SOURCES[h.source] : null;
        lines.push(...event({
          uid: `ph-${state}-${h.date}-${h.name.replace(/[^A-Za-z0-9]+/g, "-").toLowerCase()}@mycalendar`,
          start: h.date, end: h.date, stamp,
          summary: `🇲🇾 ${h.name}${flags.length ? ` (${flags.join(", ")})` : ""}`,
          description: isOfficial(y)
            ? `Public holiday, ${STATES[state]}. Source: ${src ? `${src.label} ${src.url}` : "official list"}`
            : `Estimated public holiday for ${STATES[state]} — not yet gazetted. Confirm with the official list when published.`,
        }));
      }
    }
    if (schoolHolidays) {
      for (const s of schoolHolidaysFor(state).filter((s) => s.start.startsWith(`${y}-`))) {
        const src = SOURCES[s.source];
        lines.push(...event({
          uid: `sh-${state}-${s.start}-${s.end}-${s.name.replace(/[^A-Za-z0-9]+/g, "-").toLowerCase()}@mycalendar`,
          start: s.start, end: s.end, stamp,
          summary: `🏫 ${s.name}`,
          description: `School holiday (KPM), ${STATES[state]}. Source: ${src.label} ${src.url}`,
        }));
      }
    }
    if (events) {
      for (const [date, list] of Object.entries(events)) {
        if (!date.startsWith(`${y}-`)) continue;
        list.forEach((text, i) => lines.push(...event({ uid: `me-${date}-${i}-${encodeURIComponent(text).slice(0, 40)}@mycalendar`, start: date, end: date, stamp, summary: text })));
      }
    }
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
