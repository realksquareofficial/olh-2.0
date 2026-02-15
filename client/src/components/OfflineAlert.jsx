import { useState, useEffect } from 'react';

const OfflineAlert = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      window.location.reload();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
      <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce border border-gray-700">
        <span>📡</span>
        <p className="font-bold text-sm">You're offline, connect to the internet...</p>
      </div>
    </div>
  );
};

export default OfflineAlert;