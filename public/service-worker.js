importScripts('/js/modules/cache-polyfill.js');

/**
*
* ver 7.0
* Authentication 사용 해제 (모바일 작동 원활하지 않은 것 때문)
*
*/
var dataCacheName = 'fedexData-v-7';
var cacheName = 'fedexDoc-v-7';
var filesToCache = [
    '/',
    '/index.html',
    '/js/modules/swiped.min.js',
    '/js/modules/cache-polyfill.js',
    '/js/modules/push.js',
    '/js/auth.js',
    '/js/config.js',
    '/js/index.js',
    '/index.css',
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            console.log('cache key list: ' + keyList);
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    /*
     * Fixes a corner case in which the app wasn't returning the latest data.
     * You can reproduce the corner case by commenting out the line below and
     * then doing the following steps: 1) load app for first time so that the
     * initial New York City data is shown 2) press the refresh button on the
     * app 3) go offline 4) reload the app. You expect to see the newer NYC
     * data, but you actually see the initial data. This happens because the
     * service worker is not yet activated. The code below essentially lets
     * you activate the service worker faster.
     */
    return self.clients.claim();
});

// self.addEventListener('push', function(event) {
//   console.log('[Service Worker] Push Received.');
//   console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
//
//   const title = 'Push Codelab';
//   const options = {
//     body: 'Yay it works.',
//     icon: 'images/icon.png',
//     badge: 'images/badge.png'
//   };
//
//   event.waitUntil(self.registration.showNotification(title, options));
// });

self.addEventListener('notificationclick', function(event) {
    const notification = event.notification;
    console.log('[Service Worker] Notification click Received.');
    notification.close();
});


self.addEventListener('fetch', function(e) {
    console.log('[Service Worker] Fetch', e.request.url);
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
    // var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    // if (e.request.url.indexOf(dataUrl) > -1) {
    //   /*
    //    * When the request URL contains dataUrl, the app is asking for fresh
    //    * weather data. In this case, the service worker always goes to the
    //    * network and then caches the response. This is called the "Cache then
    //    * network" strategy:
    //    * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
    //    */
    //   e.respondWith(
    //     caches.open(dataCacheName).then(function(cache) {
    //       return fetch(e.request).then(function(response){
    //         cache.put(e.request.url, response.clone());
    //         return response;
    //       });
    //     })
    //   );
    // } else {
    //   /*
    //    * The app is asking for app shell files. In this scenario the app uses the
    //    * "Cache, falling back to the network" offline strategy:
    //    * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
    //    */
    //   e.respondWith(
    //     caches.match(e.request).then(function(response) {
    //       return response || fetch(e.request);
    //     })
    //   );
    // }
});
