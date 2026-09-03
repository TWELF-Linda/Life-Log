const CACHE_NAME = 'life-log-shell-v3';
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

// 網路優先：只要裝置有網路，一律先抓最新版本（抓到就順便把快取更新成最新的）；
// 只有真的離線、網路要不到的時候，才退回用快取頂著用。
// 這樣之後更新 App 就不用再手動改版本號了——只要有網路，開啟時一定是最新版，
// 之前「安裝到主畫面的版本一直是舊的、但瀏覽器分頁卻是新的」就是這裡改的。
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('script.google.com')) return; // 不快取 GAS API 請求，一律直接走網路

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
