// Shravanam service worker — makes the app installable and lets the library open offline.
//
// Strategy:
//   - Page navigations: network first, falling back to the cached page (then the cached home page).
//   - /_next/static/*: cache first. These files are content-hashed, so a cached copy is never stale.
//   - Other same-origin GETs (icons, manifest): stale-while-revalidate.
//   - Cross-origin requests (the lecture audio): not intercepted at all, so the browser streams
//     them with normal range requests. Audio is never cached here.
//
// Bump CACHE_VERSION to force every installed copy to drop its old caches.
const CACHE_VERSION = 'v1';
const PAGE_CACHE = `shravanam-pages-${CACHE_VERSION}`;
const ASSET_CACHE = `shravanam-assets-${CACHE_VERSION}`;

const APP_PAGES = ['/', '/lectures', '/dashboard', '/about', '/sb', '/nod'];
const STATIC_FILES = [
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// Precache every page plus the JS/CSS it references, so the whole app works offline right after install.
async function precache() {
  const pageCache = await caches.open(PAGE_CACHE);
  const assetCache = await caches.open(ASSET_CACHE);

  await Promise.allSettled(STATIC_FILES.map((url) => assetCache.add(url)));

  const assetUrls = new Set();
  await Promise.allSettled(
    APP_PAGES.map(async (url) => {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) return;
      await pageCache.put(url, response.clone());
      const html = await response.text();
      for (const match of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)) {
        assetUrls.add(match[1]);
      }
    })
  );

  await Promise.allSettled([...assetUrls].map((url) => assetCache.add(url)));
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('shravanam-') && key !== PAGE_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Key by path only, so /lectures?speaker=x refreshes the single cached /lectures page.
      cache.put(new URL(request.url).pathname, response.clone());
    }
    return response;
  } catch {
    return (
      (await cache.match(request, { ignoreSearch: true })) ||
      (await cache.match('/')) ||
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(ASSET_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached || Response.error());
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Leave dev-server and HMR traffic alone.
  if (url.pathname.startsWith('/_next/webpack-hmr') || url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});
