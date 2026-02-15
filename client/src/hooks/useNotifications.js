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

  const subscribe = async () => {
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const { data } = await axiosInstance.get('/api/push/vapid-public-key');
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey)
      });

      await axiosInstance.post('/api/push/subscribe', { subscription: sub });
      setSubscription(sub);
      return true;
    } catch (error) {
      console.error('Subscription error:', error);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        await axiosInstance.delete('/api/push/unsubscribe');
        setSubscription(null);
        return true;
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return false;
    }
  };

  return { isSupported, permission, subscription, subscribe, unsubscribe };
};

export default useNotifications;