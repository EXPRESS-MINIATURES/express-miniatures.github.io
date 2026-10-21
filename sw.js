/* Garde la page en memoire : la piece du reseau n'a pas forcement de Wi-Fi,
   et le Bluetooth, lui, n'en a pas besoin. On sert le cache d'abord, puis
   on le rafraichit en arriere-plan quand le reseau repond. */
const CACHE = "express-miniatures-v10";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icone-192.png", "icone-512.png", "icone-adaptative-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const enCache = await c.match(e.request);
    const reseau = fetch(e.request).then(r => {
      if (r && (r.ok || r.type === "opaque")) c.put(e.request, r.clone());
      return r;
    }).catch(() => enCache);
    return enCache || reseau;
  }));
});
