import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const useNotifications = (user) => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

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
        try {
           await axiosInstance.post('/api/push/subscribe', { subscription: sub });
        } catch (e) {
           console.warn('Sync sub failed:', e);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        alert('Permission denied! Please enable notifications in browser settings.');
        setLoading(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      const { data } = await axiosInstance.get('/api/push/vapid-public-key');
      if (!data.publicKey) throw new Error('No public key returned from server');

      const convertedVapidKey = urlBase64ToUint8Array(data.publicKey);

      console.log('Subscribing with key:', data.publicKey);
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      await axiosInstance.post('/api/push/subscribe', { subscription: sub });
      
      setSubscription(sub);
      alert('Notifications Enabled! 🎉');
      setLoading(false);
      return true;

    } catch (error) {
      console.error('Subscription error details:', error);
      
      let msg = error.message;
      if (error.name === 'NotAllowedError') msg = 'Permission denied by browser.';
      if (error.name === 'InvalidStateError') msg = 'Service Worker not ready.';
      if (error.name === 'AbortError') msg = 'Subscription aborted.';
      
      alert(`Subscription failed: ${msg}`);
      setLoading(false);
      return false;
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
      }
      
      try {
        await axiosInstance.delete('/api/push/unsubscribe');
      } catch (e) {
        console.warn('Backend unsubscribe failed:', e);
      }

      setSubscription(null);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setLoading(false);
      return false;
    }
  };

  return { isSupported, permission, subscription, subscribe, unsubscribe, loading };
};

export default useNotifications;