// 静室 service worker —— 缓存外壳与场景图片，部署后可离线打开
const CACHE = 'jingshi-v6';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'icon.svg',
  'img/rain.jpg', 'img/forest.jpg', 'img/cafe.jpg', 'img/sea.jpg', 'img/fire.jpg', 'img/sakura.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 缓存优先，回退网络并写入缓存；离线兜底到 index.html
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match('index.html'))
    )
  );
});
