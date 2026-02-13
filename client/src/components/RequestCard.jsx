import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { AuthContext } from '../context/AuthContext';

const RequestCard = ({ request, onUpdate }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (date) => {
    const now = new Date();
    const uploaded = new Date(date);
    const diffTime = Math.abs(now - uploaded);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return uploaded.toLocaleDateString();
  };

  const getTypeEmoji = (type) => {
    switch(type) {
      case 'notes': return '📝';
      case 'question-paper': return '📄';
      case 'syllabus': return '📋';
      case 'reference-book': return '📚';
      default: return '📦';
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'master') return '👑';
    if (role === 'admin') return '⚡';
    return '';
  };

  const handleProvide = () => {
    if (!user) {
      alert('Please login to provide materials! 🔐');
      return;
    }
    navigate('/', { state: { fulfillRequestId: request._id, requestSubject: request.subject } });
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/requests/${request._id}`);
      alert('Request deleted! 🗑️');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to delete request!');
    }
  };

  const handleClose = async () => {
    try {
      await axiosInstance.patch(`/api/requests/${request._id}/close`, {});
      alert('Request closed! ✅');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to close request!');
    }
  };

  const isOwner = user && request.requestedBy?._id === user.id;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-orange-200 dark:border-orange-700 overflow-hidden relative">
        <div className="absolute top-2 right-2">
          <span className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-bold">
            REQUEST
          </span>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
              {request.requestedBy?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {request.requestedBy?.username || 'Unknown'}
                </span>
                <span className="text-lg">{getRoleBadge(request.requestedBy?.role)}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(request.createdAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-2xl">{getTypeEmoji(request.materialType)}</span>
            <h3 className="text-xl font-bold text-orange-900 dark:text-orange-300 flex-1">
              {request.subject}
            </h3>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
            {request.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {request.materialType !== 'other' && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-semibold">
                {request.materialType.replace('-', ' ')}
              </span>
            )}
            {request.regulationYear && (
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-xs font-semibold">
                Regulation: {request.regulationYear}
              </span>
            )}
          </div>

          {request.status === 'open' && (
            <button
              onClick={handleProvide}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              🤝 Provide Material
            </button>
          )}

          {isOwner && request.status === 'open' && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-all"
              >
                ✅ Close
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-all"
              >
                🗑️ Delete
              </button>
            </div>
          )}

          {request.status !== 'open' && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">
                {request.status === 'fulfilled' ? '✅ Fulfilled' : '🔒 Closed'}
              </span>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Request?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this request? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestCard;