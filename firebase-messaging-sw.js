// firebase-messaging-sw.js - MINIMAL (PWA Install Only)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase Config
firebase.initializeApp({
  apiKey: "AIzaSyAgkzgYPYpCHZbJddkoFkzWswSh3H5tsIo",
  authDomain: "nedddigitalwebsite.firebaseapp.com",
  projectId: "nedddigitalwebsite",
  storageBucket: "nedddigitalwebsite.appspot.com",
  messagingSenderId: "360940743614",
  appId: "1:360940743614:web:7eca9a842919ad569067ef"
});

const messaging = firebase.messaging();

// ============ MINIMAL SERVICE WORKER ============
// Just for PWA install - NO CACHING (online only)

self.addEventListener("install", (event) => {
  console.log("✅ PWA Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("✅ PWA Service Worker activated");
  event.waitUntil(self.clients.claim());
});

// NO FETCH HANDLER - Always use network (online mode only)

// ============ FIREBASE NOTIFICATIONS ============
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 Background notification:', payload);
  
  const title = payload.notification?.title || 'Nedd Digital Admin';
  const options = {
    body: payload.notification?.body || 'New notification',
    icon: 'https://nedddigital.netlify.app/images/nedddigitallogo.png',
    badge: 'https://nedddigital.netlify.app/images/nedddigitallogo.png'
  };

  self.registration.showNotification(title, options);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});