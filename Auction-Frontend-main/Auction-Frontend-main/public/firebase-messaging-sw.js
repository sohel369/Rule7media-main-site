// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.8/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.8/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAY5nD92Uytrx2_nmCuLmfmqTqXG8_acZ4",
  authDomain: "push-notifications-85671.firebaseapp.com",
  projectId: "push-notifications-85671",
  storageBucket: "push-notifications-85671.firebasestorage.app",
  messagingSenderId: "797161567843",
  appId: "1:797161567843:web:1996773e4b3ed76c8faa56",
  measurementId: "G-5Z5Y1C4YX8",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
