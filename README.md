# MY Calendar · 马来西亚

A Malaysia lunar calendar web app. No build step, no dependencies, installable as a PWA, works offline.

## Screens
- **Home**: year tabs (2025–2029), swipeable cards for Public Holiday / School Holiday / Salary Schedule, and a 3×4 grid of month tiles (current month outlined in green).
- **Month page**: traditional printed-calendar layout (weekdays as rows: English / 中文 / Bahasa Melayu), with Chinese lunar date (农历) and Hijri date under each day. Holidays in red, school holidays underlined blue, civil servant pay day marked `$`. A memorandum list below.
- **Day sheet**: tap any day for details and to add your own events (saved in the browser only).
- **⋮ Settings**: pick your state; holidays, school-holiday group (A/B) and weekends follow it.

## Run
```bash
python3 -m http.server 8000   # open http://localhost:8000
```

## Data
| Data | Coverage | How |
|---|---|---|
| Public holidays | 2026 | Gazetted list (`js/data.js`) |
| Public holidays | Any other year | Calculated from the rules below, per state, with replacement days |
| School holidays | 2026, 2027 (Group A & B) | KPM calendars, via secondary summaries; festive add-on days excluded |
| Civil servant pay dates | 2026, 2027 | JANM SPANM circulars, via secondary summaries |

How the calculated holidays work (`js/astro.js`, `js/calendars.js`):
- **Chinese New Year, Wesak, lunar dates**: precise new-moon times (Meeus ch. 49) at UTC+8. Wesak is the 15th day of the 4th lunation.
- **Islamic holidays, Hijri dates**: new crescent at sunset in Peninsular Malaysia under the MABIMS criteria (altitude ≥ 3°, elongation ≥ 6.4°). Crescents near the threshold are flagged "±1 day".
- **Thaipusam**: day the Moon is in Pusam nakshatra nearest the full moon of Thai (sidereal, Lahiri).
- **Deepavali**: the day before the Aippasi new moon whose sunrise falls in the 14th tithi or later.
- **Replacement days**: Sunday holidays → next working day (Sat–Sun states); Saturday holidays → next working day (Kedah, Kelantan, Terengganu); Sarawak also replaces same-day clashes.

`node tests/holidays.test.mjs` checks the rules against the 2026 gazette (all states) and against 87 past festival dates (2010–2035). Royal birthdays and one-off holidays declared by state governments can't be predicted; confirm future dates with the gazette, KPM or JANM.
