import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { precacheAndRoute } from "workbox-precaching";

// Precache our assets
precacheAndRoute([
  { url: "/", revision: "1" },
  { url: "/manifest.json", revision: "1" },
  { url: "/icon-192x192.png", revision: "1" },
  { url: "/icon-512x512.png", revision: "1" },
]);

// Cache API responses
registerRoute(
  ({ request }) => request.destination === "api",
  new StaleWhileRevalidate({
    cacheName: "api-cache",
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          if (!response.ok) {
            return null;
          }
          return response;
        },
      },
    ],
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === "image",
  new StaleWhileRevalidate({
    cacheName: "image-cache",
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          if (!response.ok) {
            return null;
          }
          return response;
        },
      },
    ],
  })
);

// Handle push notifications
self.addEventListener("push", (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: data.tag,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: "view",
          title: "View Content",
          icon: "/icon-192x192.png",
        },
      ],
    })
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  if (action === "view") {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        if ("openWindow" in self.clients) {
          return self.clients.openWindow("/");
        }
      })
    );
  }
});
