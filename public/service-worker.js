const APP_PREFIX = "BudgetTracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "/index.html",
    "/css/styles.css",
    "/js/idb.js",
    "/js/index.js",
    "/manifest.json",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon384x384.png",
    "/icons/icon-512x512.png"
];

// Install the service worker
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate the service worker and remove old data from the cache
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
              });
              cacheKeeplist.push(CACHE_NAME); 
            return Promise.all(
                keyList.map(key => {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log("Removing old cache data", key);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', function(e) {
    if(e.request.url.includes('/api')) {
        e.respondWith(
            caches
            .open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(e.request)
                .then(response => {
                 // If the response was good, clone it and store it in the cache.   
                if (response.status === 200) {
                    cache.put(e.request.url, response.clone());
                }
                return response;
                })
                .catch(err => {
                    // network request failed, try to get it from the cache
                    return cache.match(e.request);
                });
            })
            .catch(err => console.log(err))
        );
        return;
    }
    e.respondWith(
        fetch(e.request).catch(async function() {
            const response = await caches.match(e.request);
            if (response) {
                return response;
            } else if (e.request.headers.get('accept').includes('text/html')) {
                // return the cached home page for all requests for html pages   
                return caches.match('/');
            }
        })
    )
});