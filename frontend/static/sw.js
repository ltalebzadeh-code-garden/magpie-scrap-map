const SW_VERSION = 'v1';
const APP_SHELL_CACHE = `app-shell-${SW_VERSION}`;

const APP_SHELL_URLS = ['/', '/offline', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/robots.txt'];

self.addEventListener('install', (event) => {
	self.skipWaiting();

	event.waitUntil(
		caches.open(APP_SHELL_CACHE).then((cache) => {
			return cache.addAll(APP_SHELL_URLS);
		})
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((key) => key !== APP_SHELL_CACHE).map((key) => caches.delete(key))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const request = event.request;

	if (request.method !== 'GET') {
		return;
	}

	const url = new URL(request.url);

	if (url.origin !== self.location.origin) {
		return;
	}

	if (url.pathname.startsWith('/api/')) {
		return;
	}

	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request).catch(async () => {
				const cache = await caches.open(APP_SHELL_CACHE);
				const offlinePage = await cache.match('/offline');
				return offlinePage || Response.error();
			})
		);
		return;
	}

	if (url.pathname.startsWith('/_app/') || APP_SHELL_URLS.includes(url.pathname)) {
		event.respondWith(
			caches.match(request).then((cachedResponse) => {
				if (cachedResponse) {
					return cachedResponse;
				}

				return fetch(request).then((networkResponse) => {
					if (networkResponse && networkResponse.ok) {
						const responseClone = networkResponse.clone();
						void caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, responseClone));
					}

					return networkResponse;
				});
			})
		);
	}
});