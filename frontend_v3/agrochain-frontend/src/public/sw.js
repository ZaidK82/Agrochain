// public/sw.js (Service Worker)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('agrochain-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        // Essential assets
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})