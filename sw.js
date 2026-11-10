// Service worker: versioned app-shell cache.
// - A new version installs in the background and WAITS; the app shows an "update" bar and
//   activates it only when the user taps (message "SKIP_WAITING"), then reloads once.
// - App files are served cache-first, so the app opens instantly and works offline.
// - Calendar feeds (ics/) go network-first so subscribers get fresh data.
// Release: bump VERSION here and in js/version.js (tests check they match).
const VERSION = "1.11.0";
const CACHE = `mycalendar-${VERSION}`;
const SHELL = [
  "./", "index.html", "style.css", "manifest.webmanifest", "icon.svg",
  "js/app.js", "js/data.js", "js/calendars.js", "js/astro.js", "js/ics.js", "js/longweekend.js",
  "js/i18n.js", "js/countries.js", "js/festivals.js", "js/version.js", "js/vendor/qrcode.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  // cache: "reload" bypasses the HTTP cache so the new version gets fresh files
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: "reload" })))));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("mycalendar-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
  if (e.data === "GET_VERSION") e.source?.postMessage({ type: "VERSION", version: VERSION });
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // external links: browser default

  // Calendar feeds: network first, cached copy when offline.
  if (url.pathname.includes("/ics/")) {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req)));
    return;
  }

  // Page navigations: the cached app shell (the hash router handles the rest).
  if (req.mode === "navigate") {
    e.respondWith(caches.match("index.html").then((hit) => hit || fetch(req)));
    return;
  }

  // App files: cache first, then network (and keep a copy, e.g. launch images).
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});
