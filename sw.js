/* MY Calendar · service worker (same approach as CompareCast and the Woo Brothers app standard).

   - Network first for our own files, with 'no-cache' so GitHub Pages' 10-minute HTTP cache
     cannot serve an old build; the cache is only the offline fallback. A new build therefore
     arrives on the first launch after it goes live.
   - No release number here: the page notices a new build from index.html's Last-Modified
     (whatsnew.js WhatsNew.watch) and offers "Update now / Later". This file changes only when
     the worker's own logic does.
   - One cache with this app's own prefix. Every app on bryanwoo988.github.io shares the same
     Cache Storage, so only caches starting with "mycalendar-" are ever deleted. */
const SHELL = "mycalendar-shell";
const SHELL_FILES = [
  "./", "./index.html", "./style.css", "./manifest.webmanifest", "./icon.svg", "./whatsnew.js",
  "./js/app.js", "./js/data.js", "./js/calendars.js", "./js/astro.js", "./js/ics.js", "./js/longweekend.js",
  "./js/i18n.js", "./js/countries.js", "./js/festivals.js", "./js/version.js", "./js/zodiac.js", "./js/vendor/qrcode.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png",
];

/* How long to wait for the network before falling back to the cache: long enough for a slow
   mobile connection, short enough that a dead one does not leave a blank screen. */
const NET_TIMEOUT_MS = 2500;

/* All our files must be cached or the install is abandoned, so a half-cached build never
   replaces a complete one. 'reload' skips the HTTP cache. */
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await c.addAll(SHELL_FILES.map((u) => new Request(u, { cache: "reload" })));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("mycalendar-") && k !== SHELL).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* One cache entry per file, whatever query string asked for it. */
const keyFor = (url) => { const u = new URL(url); u.search = ""; u.hash = ""; return u.href; };

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return; // external: browser default

  e.respondWith((async () => {
    const cached = await caches.match(keyFor(req.url));
    let timer;
    const timeout = new Promise((r) => { timer = setTimeout(() => r(null), NET_TIMEOUT_MS); });
    const net = (req.mode === "navigate"
      ? fetch(req.url, { cache: "no-cache", credentials: "same-origin" })
      : fetch(req, { cache: "no-cache" })
    ).then((res) => {
      if (res && res.ok) caches.open(SHELL).then((c) => c.put(keyFor(req.url), res.clone())).catch(() => {});
      return res && res.ok ? res : null;
    }).catch(() => null);

    const fresh = await Promise.race([net, timeout]);
    clearTimeout(timer);
    if (fresh) return fresh;
    if (cached) return cached;
    const late = await net; // nothing cached: let a slow network finish
    if (late) return late;
    if (req.mode === "navigate") {
      const fallback = await caches.match(keyFor(new URL("./index.html", self.location).href));
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  })());
});
