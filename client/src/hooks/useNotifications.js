import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { requestForToken, onMessageListener } from '../firebase';

const useNotifications = (user) => {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState(Notification.permission);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Notification.permission === 'granted') {
      subscribe(); 
    }
    
    onMessageListener().then(payload => {
      console.log('Foreground Message:', payload);
      const { title, body } = payload.notification;
      new Notification(title, { body, icon: '/logo.png' });
    });
  }, []);

  const subscribe = async () => {
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

  return { permission, token, subscribe, unsubscribe, loading };
};

export default useNotifications;