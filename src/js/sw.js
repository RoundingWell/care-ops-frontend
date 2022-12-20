import { clientsClaim } from 'workbox-core';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { registerRoute, Route } from 'workbox-routing';
import { NetworkOnly, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { PrecacheFallbackPlugin, precacheAndRoute } from 'workbox-precaching';

// Ensure that updates to the underlying service worker take effect immediately
// for both the current client and all other active clients.
self.skipWaiting();
clientsClaim();

// precache webpack manifest
precacheAndRoute(self.__WB_MANIFEST);

// Only cache navigation for production
if (_PRODUCTION_) {
  // Any navigation loads the precached index.html
  const networkOnlyNavigationRoute = new Route(({ request }) => {
    return request.mode === 'navigate';
  }, new NetworkOnly({
    plugins: [
      new PrecacheFallbackPlugin({ fallbackURL: '/index.html' }),
    ],
  }));

  registerRoute(networkOnlyNavigationRoute);
}

const staticAssetsRoute = new Route(({ request }) => {
  return ['image'].includes(request.destination);
}, new CacheFirst({ cacheName: 'cache-static-assets' }));

registerRoute(staticAssetsRoute);

// Hashing cache names that are unique per build for cache clean up
function getHashedCacheName(name) {
  return `hashed-${ _NOW_ }-${ name }`;
}

// Delete all hashed caches except the current one
async function deleteHashedCache() {
  const cacheNames = await self.caches.keys();

  const cacheNamesToDelete = cacheNames.filter(cacheName => {
    return (
      cacheName.startsWith('hashed-')
      && !cacheName.startsWith(`hashed-${ _NOW_ }`)
    );
  });

  await Promise.all(
    cacheNamesToDelete.map(cacheName => self.caches.delete(cacheName)),
  );

  return cacheNamesToDelete;
}

deleteHashedCache();

const staticHashedAssetsRoute = new Route(({ request }) => {
  return ['script', 'style'].includes(request.destination);
}, new CacheFirst({ cacheName: getHashedCacheName('static-hashed-assets') }));

registerRoute(staticHashedAssetsRoute);

registerRoute(
  ({ url }) => url.pathname.includes('appconfig.json'),
  new NetworkFirst({ cacheName: 'cache-appconfig' }),
);

// Caches api GET responses for the listed status codes
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'cache-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200, 404],
      }),
    ],
  }),
);

const bgSyncPlugin = new BackgroundSyncPlugin('form-responses', {
  maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (specified in minutes)
});

// Retries POST requests to /api/form-responses when offline
registerRoute(
  /\/api\/form-responses/,
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST',
);

