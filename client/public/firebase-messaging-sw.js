importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyD3-UwQ29ZGgRtxrjCo_nlrqiFeaiYg4vk",
  authDomain: "olh-2-0-push.firebaseapp.com",
  projectId: "olh-2-0-push",
  storageBucket: "olh-2-0-push.firebasestorage.app",
  messagingSenderId: "163248585748",
  appId: "1:163248585748:web:0880015567f24d6d9d3b01"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});