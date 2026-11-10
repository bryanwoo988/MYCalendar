# Release rule

Every change that ships to users adds an entry at the top of `RELEASES` in `js/version.js`:
the new version number, today's date and time (YYYY-MM-DD HH:MM) in Malaysian time, and what
changed in plain words for users, in every language the app supports (zh, en, ms).
After the update the app shows these notes once ("what's new" sheet, `whatsnew.js`), and
⋮ → About shows the current version and the full history. `tests/holidays.test.mjs` checks the format.

Version numbers: bug fixes bump the last digit, new features the middle one.

Shared standard for all of Bryan Woo's apps (including new ones):
https://github.com/bryanwoo988/woobrothers.my/blob/main/APP-STANDARDS.md
`whatsnew.js` is a copy of `shared/whatsnew.js` from that repo; update it from there, don't edit it here.

# Service worker

`sw.js` follows CompareCast: network first with `cache: "no-cache"` (2.5 s timeout, cache as
offline fallback), one cache named `mycalendar-shell`, and it deletes only caches starting with
`mycalendar-` (all apps share bryanwoo988.github.io). It has no version number: the page detects a
new build from index.html's Last-Modified (`WhatsNew.watch()`) and offers "Update now / Later".
Add any new app file to `SHELL_FILES`; the tests fail if a listed file is missing.

# Data

Public and school holidays must come from official sources (gazette, JPM/BKPP, KPM, each
country's government). Never fill dates from memory or secondary sites; if the official
document can't be read, leave the year out and say so. Before merging run:

    node tests/holidays.test.mjs
    python3 -m http.server 8765 & node tests/ui-smoke.mjs http://localhost:8765/

Merge to main when tests pass (the owner has asked for this); GitHub Pages deploys in ~1 minute.
