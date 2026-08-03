const CACHE_NAME = 'life-log-shell-v1';
const SHELL_FILES = ['./index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 只快取「外殼」檔案本身；API 呼叫（Google Apps Script）一律直接走網路，
// 確保紀錄資料永遠是最新的，不會被快取住。
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('script.google.com')) return; // 不快取 GAS API 請求

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});
