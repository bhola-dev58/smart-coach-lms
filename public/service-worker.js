// Gradify Academy — Service Worker (stub)
// No offline caching implemented yet.
// This file exists to silence 404 errors from browsers that previously registered a SW.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
