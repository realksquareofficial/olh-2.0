import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';


const Notifications = ({ show, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (show) {
      fetchNotifications();
    }
  }, [show]);


  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };


  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error(error);
    }
  };


  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };


  if (!show) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[600px] overflow-hidden border-2 border-indigo-200 dark:border-gray-700">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            📬 Notifications
          </h3>
          <button onClick={onClose} className="text-2xl hover:bg-white/20 rounded-full p-1">
            ✖️
          </button>
        </div>


        {notifications.length > 0 && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={markAllAsRead}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Mark all as read
            </button>
          </div>
        )}


        <div className="overflow-y-auto max-h-[500px]">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.read && markAsRead(notif._id)}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    !notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">
                      {notif.type === 'approved' ? '✅' : '❌'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {notif.type === 'approved' 
                          ? 'Material Approved!' 
                          : 'Material Rejected'}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>{notif.materialTitle}</strong>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        By: <span className="font-semibold">{notif.actionBy?.username}</span>
                        {notif.actionBy?.role === 'master' && ' 👑'}
                        {notif.actionBy?.role === 'admin' && ' ⚡'}
                      </p>
                      {notif.reason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded">
                          <p className="text-xs text-red-800 dark:text-red-300">
                            <strong>Reason:</strong> {notif.reason}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default Notifications;