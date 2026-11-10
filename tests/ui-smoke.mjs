// Browser smoke test: opens every view in several modes and fails on any page error.
// Needs Playwright with Chromium. Run with a local server:
//   python3 -m http.server 8765 & node tests/ui-smoke.mjs http://localhost:8765/
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");

const base = process.argv[2] || "http://localhost:8765/";
const MODES = [
  { country: "MY", region: "KUL" }, { country: "MY", region: "ALL" }, { country: "MY", region: "KTN" }, { country: "MY", region: "SWK" },
  { country: "TW" }, { country: "CN" }, { country: "JP" },
];
const browser = await chromium.launch();
const page = await (await browser.newContext({ ...devices["iPhone 13"] })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let views = 0;
for (const lang of ["zh", "en", "ms"]) {
  for (const m of MODES) {
    await page.goto(base);
    await page.evaluate(([m, lang]) => {
      localStorage.setItem("country", JSON.stringify(m.country));
      if (m.region) localStorage.setItem("region", JSON.stringify(m.region));
      localStorage.setItem("lang", JSON.stringify(lang));
    }, [m, lang]);
    const hashes = ["#/", ...Array.from({ length: 12 }, (_, i) => `#/m/2026-${String(i + 1).padStart(2, "0")}`),
      ...["public", "school", "long", "compare"].flatMap((c) => [`#/c/${c}/2026`, `#/c/${c}/2028`])];
    for (const h of hashes) {
      const before = errors.length;
      await page.goto(base + h);
      await page.waitForTimeout(60);
      const visible = await page.evaluate(() => [...document.querySelectorAll("main.view")].some((v) => !v.hidden));
      if (!visible) errors.push(`no view visible at ${h}`);
      if (errors.length > before) console.log(`FAIL ${lang} ${JSON.stringify(m)} ${h}: ${errors.slice(before).join("; ")}`);
      views++;
    }
  }
}
await browser.close();
console.log(errors.length ? `${errors.length} error(s) in ${views} views` : `UI smoke: ${views} views, no errors`);
process.exitCode = errors.length ? 1 : 0;
