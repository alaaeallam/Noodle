/* eslint-disable no-undef */
// Service worker: background push notifications only (no offline caching).
//
// The Firebase web config is NOT hardcoded here - it comes from the backend's
// configuration (same values the app uses in the foreground) and is passed in
// as query params when the page registers this worker:
//   /sw.js?apiKey=...&projectId=...&messagingSenderId=...&appId=...
// See app/NotificationInitialzer.tsx.

importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");

const params = new URL(self.location.href).searchParams;
const firebaseConfig = {
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  storageBucket: params.get("storageBucket"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
  firebase.initializeApp(firebaseConfig);

  firebase.messaging().onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Notification";
    self.registration.showNotification(title, {
      body: payload.notification?.body,
      icon: "/192.png",
      data: payload.data,
    });
  });
}

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const redirectUrl = event.notification.data?.redirectUrl;
  if (!redirectUrl) return;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === redirectUrl && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(redirectUrl);
    })
  );
});
