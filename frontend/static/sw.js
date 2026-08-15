const SW_VERSION = 'v2';
const APP_SHELL_CACHE = `app-shell-${SW_VERSION}`;
const RUNTIME_CACHE = `runtime-v${SW_VERSION}`;
const TTL_LONG_MS = 30 * 60 * 1000;  // 30 min — /, /app, /list
const TTL_SHORT_MS = 10 * 60 * 1000; // 10 min — /resource/[id]

const APP_SHELL_URLS = ['/', '/app', '/offline', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/robots.txt'];

function getTtl(pathname) {
	return pathname.startsWith('/resource/') ? TTL_SHORT_MS : TTL_LONG_MS;
}

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
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
						.map((key) => caches.delete(key))
				)
			)
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
			fetch(request)
				.then(async (networkResponse) => {
					const clone = networkResponse.clone();
					const headers = new Headers(clone.headers);
					headers.set('x-sw-cached-at', String(Date.now()));
					headers.set('x-sw-ttl', String(getTtl(url.pathname)));
					const cachedResponse = new Response(clone.body, {
						status: clone.status,
						statusText: clone.statusText,
						headers
					});
					const cache = await caches.open(RUNTIME_CACHE);
					cache.put(request, cachedResponse);
					return networkResponse;
				})
				.catch(async () => {
					const cache = await caches.open(RUNTIME_CACHE);
					const cached = await cache.match(request);
					if (cached) {
						return cached;
					}
					const shellCache = await caches.open(APP_SHELL_CACHE);
					const offlinePage = await shellCache.match('/offline');
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
