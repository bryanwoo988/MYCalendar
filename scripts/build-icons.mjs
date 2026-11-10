// Renders PNG icons and iPhone launch images from icon.svg (needs Playwright + Chromium).
// Run after changing icon.svg or the splash design: node scripts/build-icons.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const svg = readFileSync(new URL("../icon.svg", import.meta.url), "utf8");
const out = (f) => new URL(`../icons/${f}`, import.meta.url).pathname;
const browser = await chromium.launch();
const page = await browser.newPage();

async function render(file, w, h, html) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${html}</body></html>`);
  await page.screenshot({ path: out(file), omitBackground: true });
}
const plain = (s) => `<div style="width:${s}px;height:${s}px">${svg.replace("<svg ", `<svg width="${s}" height="${s}" `)}</div>`;
// Maskable: full-bleed background, artwork inside the 80% safe zone.
const maskable = (s) => `<div style="width:${s}px;height:${s}px;background:#0d1660;display:grid;place-items:center">${svg.replace("<svg ", `<svg width="${s * 0.8}" height="${s * 0.8}" `).replace('rx="14"', 'rx="0"')}</div>`;

await render("icon-192.png", 192, 192, plain(192));
await render("icon-512.png", 512, 512, plain(512));
await render("maskable-512.png", 512, 512, maskable(512));
await render("apple-touch-icon.png", 180, 180, maskable(180));

// iPhone launch images (portrait, device pixels)
const SIZES = [[750, 1334], [828, 1792], [1125, 2436], [1170, 2532], [1179, 2556], [1284, 2778], [1290, 2796], [1206, 2622], [1320, 2868]];
for (const [w, h] of SIZES) {
  const s = Math.round(w * 0.28);
  await render(`splash-${w}x${h}.png`, w, h, `<div style="width:${w}px;height:${h}px;background:#0d1660;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(w * 0.05)}px;font-family:-apple-system,system-ui,sans-serif;color:#fff">
    ${svg.replace("<svg ", `<svg width="${s}" height="${s}" `).replace('fill="#0d1660"/>', 'fill="#1a2580"/>')}
    <div style="font-size:${Math.round(w * 0.075)}px;font-weight:800;letter-spacing:1px">MY Calendar</div>
    <div style="font-size:${Math.round(w * 0.04)}px;opacity:.75">马来西亚日历 · Kalendar MY</div></div>`);
}
await browser.close();
console.log(`Wrote 4 icons and ${SIZES.length} launch images to icons/`);
