const CACHE = "mycalendar-v10";
const FILES = ["./", "index.html", "style.css", "js/app.js", "js/data.js", "js/calendars.js", "js/astro.js", "js/ics.js", "js/longweekend.js", "js/i18n.js", "js/countries.js", "js/vendor/qrcode.js", "manifest.webmanifest", "icon.svg"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))));
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
));
// Network first so data updates arrive; fall back to cache when offline.
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
