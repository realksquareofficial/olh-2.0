import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const VAPID_PUBLIC_KEY = 'BKlyM09d_3m2sg0sPIiwcy43lzChI-xkvNfpUjo-ZnYqClT8k4PYF5NVo7s1VvZcQq0rA0GnNsIvPmv40yp9eXg';

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
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      console.log('Subscribing with key:', VAPID_PUBLIC_KEY);
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      console.log('Sending subscription to backend...');
      await axiosInstance.post('/api/push/subscribe', { subscription: sub });
      
      setSubscription(sub);
      alert('Notifications Enabled! 🎉');
      setLoading(false);
      return true;

    } catch (error) {
      console.error('Subscription error details:', error);
      alert(`Subscription failed: ${error.message}`);
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