// Service Worker para NutriClinic PWA
const CACHE_NAME = "nutriclinic-v1";
const STATIC_ASSETS = [
  "/",
  "/pacientes",
  "/alimentos",
  "/calculadora",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Algunos assets iniciales no pudieron ser cacheados:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignorar peticiones que no sean GET o que sean de streaming pesado (como pdf o backup grande)
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api/backup") ||
    url.pathname.startsWith("/api/documentos/tafera-pdf")
  ) {
    return;
  }

  // Estrategia Network-First con fallback a Cache para páginas y datos
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback a la raíz si no hay conexión
        return caches.match("/");
      })
  );
});
