import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const useNotifications = (user) => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        setSubscription(sub);
        // Ensure backend has it too!
        await axiosInstance.post('/api/push/subscribe', { subscription: sub });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribe = async () => {
    try {
      console.log('Requesting permission...');
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        alert('Permission denied! Please enable notifications in browser settings.');
        return false;
      }

      console.log('Permission granted! Registering SW...');
      const registration = await navigator.serviceWorker.ready;
      
      console.log('Fetching VAPID key...');
      const { data } = await axiosInstance.get('/api/push/vapid-public-key');
      console.log('VAPID Key received:', data.publicKey);
      
      console.log('Subscribing to PushManager...');
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey)
      });
      console.log('PushManager subscription successful:', sub);

      console.log('Sending subscription to backend...');
      await axiosInstance.post('/api/push/subscribe', { subscription: sub });
      console.log('Backend saved subscription!');

      setSubscription(sub);
      return true;
    } catch (error) {
      console.error('Subscription error details:', error);
      alert(`Subscription failed: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
      }
      await axiosInstance.delete('/api/push/unsubscribe');
      setSubscription(null);
      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return false;
    }
  };

  return { isSupported, permission, subscription, subscribe, unsubscribe };
};

export default useNotifications;