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

## Data (`js/data.js`, `js/calendars.js`)
| Data | Coverage | Source |
|---|---|---|
| Public holidays | 2026, 2027 (provisional) | Third-party summaries of federal/state gazettes |
| School holidays | 2026, Group A & B | Summaries of KPM Surat Siaran Bil. 3/2025 (festive add-on days excluded) |
| Pay dates | 2026 | Summaries of SPANM Bil. 5/2025 + JANM amendments |
| Lunar dates | Any year | Browser `Intl` Chinese calendar |
| Hijri dates | Any year | Browser `Intl` Islamic calendar, shifted 1 day; matched every 2026 Malaysian Islamic holiday, but approximate |

Confirm dates against the official gazette, KPM or JANM before relying on them.
