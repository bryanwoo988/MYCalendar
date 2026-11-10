# MY Calendar · 马来西亚

A Malaysia lunar calendar web app. No build step, no dependencies, installable as a PWA, works offline.

## Screens
- **State filter** (top bar, every screen): all 13 states and 3 Federal Territories. Public holidays, replacement days, school-holiday group (A/B) and KPM festive days follow the state.
- **Home**: year tabs, Public Holiday / School Holiday cards, 3×4 month tiles.
- **Month page**: traditional layout with Chinese lunar and Hijri dates under each day.
- **Long Weekend**: every break of 3+ days around a public holiday, for your state or all states, with optional annual-leave days (0–2) to bridge gaps. Chips show weekend / public holiday / annual leave. Uses each state's own weekend (Fri–Sat in Kedah, Kelantan, Terengganu).
- **Country** (⋮ settings): Malaysia, Singapore, Taiwan, Hong Kong, China, Indonesia, South Korea, Thailand, Vietnam. Other countries show official public holidays for years that have been published (2026, 2027); no estimates.
- **Compare**: trip planning. Your long weekends (with optional leave) next to the destination's public holidays: busy (they are on holiday too) or quiet (normal working days), plus both calendars merged by date.
- **Phone calendar**: subscribe (auto-updating feed per state) or download an `.ics` file.

## Run
```bash
python3 -m http.server 8000   # open http://localhost:8000
node tests/holidays.test.mjs  # data checks
node scripts/build-ics.mjs    # rebuild ics/<STATE>.ics after editing data
```
Subscription links (`webcal://…/ics/<STATE>.ics`) only work once the site is hosted online, e.g. GitHub Pages.

## Data and sources
| Data | Years | Source |
|---|---|---|
| Public holidays, all 16 states | 2026, 2027 | Prime Minister's Department (BKPP) official lists: [HKA 2026](https://www.kabinet.gov.my/storage/2025/08/HKA-2026.pdf), [HKA 2027](https://www.kabinet.gov.my/storage/2026/08/HKA_2027.pdf) |
| Replacement days | all | Holidays Act 1951 s.3 (Sunday rest-day states only); Sarawak by gazette ([Swk. L.N. 202/2026](https://lawnet.sarawak.gov.my/lawnet_file/Subsidiary/SUB_Issue%20No.%2044_L.N.%20202%20PUBLICHOLIDAY.pdf)). Kedah, Kelantan, Terengganu and Sabah announce their own; not added automatically |
| Public holidays | 2028+ | **Estimated**: same rules as the official lists + astronomy (see below). Labelled "estimated" |
| School holidays incl. KPM festive days | 2026 | [KPM Surat Siaran Bil. 3/2025](https://www.kabinet.gov.my/storage/2025/10/SS-KPM-Bil.-3-2025-Kalendar-Akademik-2026-1.pdf), [2025/2026 (pindaan)](https://www.kabinet.gov.my/storage/2025/04/tp25-pindaan.pdf) |
| School holidays | 2027 | Not included: the official KPM document could not be retrieved (moe.gov.my blocks automated access) |

Estimation rules (`js/astro.js`, `js/calendars.js`): precise new moons (Meeus ch. 49) for the Chinese calendar; MABIMS crescent visibility for Hijri dates; Tamil-calendar rules for Thaipusam and Deepavali. `tests/holidays.test.mjs` checks that the rules reproduce the official 2026 and 2027 lists for every state (one known exception: the Sultan of Pahang's birthday moved from 31 to 30 July) and 94 past festival dates.

Royal birthdays and one-off holidays can change; always confirm future dates with the official list.

### Other countries (`js/countries.js`)
| Country | 2026 & 2027 source |
|---|---|
| Singapore | Ministry of Manpower public-holidays page |
| Taiwan | 行政院人事行政總處 政府行政機關辦公日曆表 (115, 116) |
| Hong Kong | GovHK / 1823 general holidays |
| China | 国务院办公厅 节假日安排通知 (国办发明电〔2025〕7号, 〔2026〕10号), incl. 调休上班 days |
| Indonesia | SKB 3 Menteri (libur nasional + cuti bersama), Kemenko PMK |
| South Korea | KASI 월력요항 calendar data; MOIS notice for Constitution Day 2026. Labour Day 2026 marked unconfirmed |
| Thailand | Bank of Thailand financial-institution holidays |
| Vietnam | Government Office 9859/VPCP-KGVX and 10065/VPCP-KGVX with Ministry of Home Affairs notices |
