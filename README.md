# MY Calendar

A Malaysia calendar web app: month view, national and state public holidays, and your own events (saved in the browser). No build step, no dependencies. Installable as a PWA and works offline.

## Features
- Pick any of the 13 states or 3 Federal Territories; holidays and weekends adjust (Kedah, Kelantan and Terengganu use a Friday–Saturday weekend).
- Public holidays highlighted, with replacement holidays.
- Add or delete personal events per day (stored in `localStorage`).
- Light/dark mode, mobile layout, keyboard ← / → to change month.

## Run
```bash
python3 -m http.server 8000
# open http://localhost:8000
```
ES modules don't load from `file://`, so serve it over HTTP. Any static host (GitHub Pages, Netlify) works.

## Holiday data
Edit `js/holidays.js`. 2026 is filled from cross-checked listings of the federal and state gazettes; 2027 entries are marked `provisional` until gazetted. Islamic holidays depend on moon sighting and can shift. Some state holidays (e.g. Pahang, Perak, Kelantan, Johor royal birthdays) are not yet included because the sources disagreed. Confirm against the official gazette before relying on a date.
