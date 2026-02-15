import { useState, useEffect } from 'react';

const OfflineAlert = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
      <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce">
        <span>📡</span>
        <div>
          <p className="font-bold">You are offline</p>
          <p className="text-xs">Viewing cached version</p>
        </div>
      </div>
    </div>
  );
};

export default OfflineAlert;