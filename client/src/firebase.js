import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD3-UwQ29ZGgRtxrjCo_nlrqiFeaiYg4vk",
  authDomain: "olh-2-0-push.firebaseapp.com",
  projectId: "olh-2-0-push",
  storageBucket: "olh-2-0-push.firebasestorage.app",
  messagingSenderId: "163248585748",
  appId: "1:163248585748:web:0880015567f24d6d9d3b01"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    let registration;
    if ('serviceWorker' in navigator) {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
    } else {
      throw new Error('Service workers are not supported in this browser.');
    }

    const currentToken = await getToken(messaging, { 
      vapidKey: 'BKCO88JCXcA-gSVfBo5fu0Qbkn0eapSQx4CgDEwVcCKXhOb_znvMaW9yY9FO-lgHjM9vkOESfbgN2huirGFSZz4',
      serviceWorkerRegistration: registration
    });

    if (currentToken) {
      console.log('FCM Token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token: ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });