import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { requestForToken, onMessageListener } from '../firebase';

const useNotifications = (user) => {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'default'
  );
  const [loading, setLoading] = useState(false);
  
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (supported && Notification.permission === 'granted') {
      subscribe(); 
    }
    
    if (supported) {
      onMessageListener().then(payload => {
        console.log('Foreground Message:', payload);
        const { title, body } = payload?.notification || {};
        if (title) {
          new Notification(title, { body, icon: '/logo.png' });
        }
      }).catch(err => console.log('Message listener error:', err));
    }
  }, []);

  const subscribe = async () => {
    if (!isSupported) return false;
    
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        const fcmToken = await requestForToken();
        if (fcmToken) {
          setToken(fcmToken);
          await axiosInstance.post('/api/push/subscribe', { token: fcmToken }); 
          setLoading(false);
          return true;
        }
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Subscription failed:', error);
      setLoading(false);
      return false;
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete('/api/push/unsubscribe'); 
      setToken(null);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      setLoading(false);
      return false;
    }
  };

  return { isSupported, permission, token, subscribe, unsubscribe, loading };
};

export default useNotifications;