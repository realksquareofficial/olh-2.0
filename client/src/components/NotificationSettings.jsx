import { useState, useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';

const NotificationSettings = ({ user }) => {
  const { isSupported, permission, subscribe, unsubscribe } = useNotifications(user);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    if (permission === 'granted') {
      await unsubscribe();
    } else {
      await subscribe();
    }
    setLoading(false);
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-600">Push notifications not supported on this device</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">🔔 Push Notifications</h3>
      <p className="text-gray-600 mb-4">
        Get notified when your materials are approved/rejected or requests are fulfilled
      </p>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-6 py-2 rounded-lg font-semibold transition ${
          permission === 'granted'
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Loading...' : permission === 'granted' ? 'Disable Notifications' : 'Enable Notifications'}
      </button>
      {permission === 'denied' && (
        <p className="text-red-500 mt-2 text-sm">
          Notifications blocked. Enable them in your browser settings.
        </p>
      )}
    </div>
  );
};

export default NotificationSettings;