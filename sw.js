// Service worker do ListO — app shell offline-first (R36, R37).
const CACHE = "listo-shell-v1";
const SHELL = ["/listo/", "/listo/index.html", "/listo/manifest.webmanifest", "/listo/icons/icon-192.png", "/listo/icons/icon-512.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((chave) => chave !== CACHE).map((chave) => caches.delete(chave))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;

  if (requisicao.method !== "GET") return;
  if (new URL(requisicao.url).origin !== self.location.origin) return;

  // Navegação: rede primeiro, cache do shell como rede de segurança.
  if (requisicao.mode === "navigate") {
    evento.respondWith(
      fetch(requisicao)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CACHE).then((cache) => cache.put("/listo/index.html", copia));
          return resposta;
        })
        .catch(() => caches.match("/listo/index.html").then((cacheado) => cacheado || caches.match("/listo/"))),
    );
    return;
  }

  // Estáticos (JS/CSS/ícones): cache primeiro, rede depois guardando a cópia.
  evento.respondWith(
    caches.match(requisicao).then((cacheado) => {
      if (cacheado) return cacheado;
      return fetch(requisicao).then((resposta) => {
        if (resposta.ok) {
          const copia = resposta.clone();
          caches.open(CACHE).then((cache) => cache.put(requisicao, copia));
        }
        return resposta;
      });
    }),
  );
});
