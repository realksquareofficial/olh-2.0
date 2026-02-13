import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axios';
import API_URL from '../config/api';
import { AuthContext } from '../context/AuthContext';

const MaterialCard = ({ material, onUpdate }) => {
  const { user } = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [pendingVote, setPendingVote] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  const isOwnMaterial = user && material.uploadedBy?._id === user.id;
  const isAdmin = user && ['admin', 'master'].includes(user.role);

  const userVote = material.votes?.find(v => v.user === user?.id);
  const hasUpvoted = userVote?.voteType === 'upvote';
  const hasDownvoted = userVote?.voteType === 'downvote';

  useEffect(() => {
    if (user) {
      setIsFavorited(material.favorites?.includes(user.id) || false);
    }
  }, [material, user]);

  useEffect(() => {
    if (user && Array.isArray(material.votes)) {
      const existing = material.votes.find(
        v => v.user?.toString?.() === user.id || v.user === user.id
      );
      setHasVoted(!!existing);
    } else {
      setHasVoted(false);
    }
  }, [material, user]);

  const handleVote = async (voteType) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }
    if (isOwnMaterial) {
      alert("You can't vote on your own material");
      return;
    }
    if (hasVoted) {
      alert('You have already voted on this material. Voting cannot be changed.');
      return;
    }

    setPendingVote(voteType);
    setShowVoteDialog(true);
  };

  const confirmVote = async () => {
    if (!pendingVote) return;
    
    try {
      const { data } = await axiosInstance.post(
        `/api/materials/${material._id}/vote`,
        { voteType: pendingVote }
      );
      console.log('Vote response:', data);
      console.log('Votes array:', data.votes);
      console.log('User ID:', user.id);
      onUpdate(data);
      setHasVoted(true);
      setShowVoteDialog(false);
      setPendingVote(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to vote');
      setShowVoteDialog(false);
      setPendingVote(null);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      alert('Please login to favorite');
      return;
    }
    try {
      const { data } = await axiosInstance.post(
        `/api/materials/${material._id}/favorite`,
        {}
      );
      onUpdate(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      return; // Don't submit if empty
    }
    try {
      await axiosInstance.post(
        `/api/materials/${material._id}/report`,
        { reason: reportReason }
      );
      setShowReportDialog(false);
      setReportReason('');
      setShowReportSuccess(true);
      setTimeout(() => setShowReportSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to submit report');
    }
  };

  const handleApprove = async () => {
    try {
      const { data } = await axiosInstance.patch(
        `/api/materials/${material._id}/approve`,
        {}
      );
      onUpdate(data);
    } catch (error) {
      console.error(error);
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      return;
    }
    try {
      await axiosInstance.patch(
        `/api/materials/${material._id}/reject`,
        { reason: rejectReason }
      );
      onUpdate(null);
      setShowRejectDialog(false);
      setRejectReason('');
    } catch (error) {
      console.error(error);
      alert('Failed to reject material');
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/materials/${material._id}`);
      onUpdate(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error(error);
      alert('Failed to delete material');
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 olh-theme:bg-white olh-theme:border-2 olh-theme:border-olh-primary rounded-lg shadow-md p-6 relative">
        <div className="absolute top-4 right-4 flex gap-2 items-center">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            material.verificationStatus === 'approved' ? 'bg-green-500 text-white' :
            material.verificationStatus === 'pending' ? 'bg-yellow-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {material.verificationStatus.toUpperCase()}
          </span>
        </div>

        {material.linkedRequest && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 olh-theme:bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 olh-theme:text-blue-700">
              📌 Linked to request: {material.linkedRequest.subject || material.linkedRequest}
            </p>
          </div>
        )}

        <h3 className="text-xl font-bold mb-2 dark:text-white olh-theme:text-gray-900 pr-24">{material.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 olh-theme:text-gray-700 mb-2 font-semibold">{material.subject}</p>
        <p className="text-gray-500 dark:text-gray-400 olh-theme:text-gray-600 text-sm mb-3">{material.description}</p>
        
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 olh-theme:bg-gray-200 rounded text-xs dark:text-white olh-theme:text-gray-700">
            {material.source}
          </span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 olh-theme:bg-gray-200 rounded text-xs dark:text-white olh-theme:text-gray-700">
            {material.regulationYear}
          </span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 olh-theme:bg-gray-200 rounded text-xs dark:text-white olh-theme:text-gray-700">
            {material.materialType}
          </span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 olh-theme:text-gray-600 mb-2">
          Uploaded by: {material.uploadedBy?.username || 'Unknown'}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 olh-theme:text-gray-600 mb-4">
          Views: {material.views || 0} | Trust Score: {material.trustScore || 0}
        </p>

        <div className="flex gap-3 mb-4">
          <a
            href={`${API_URL}${material.fileUrl}?inline=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 olh-theme:text-olh-primary hover:underline"
          >
            📄 View PDF
          </a>
          <a
            href={`${API_URL}/api/materials/${material._id}/download`}
            className="text-green-600 dark:text-green-400 olh-theme:text-green-600 hover:underline"
          >
            ⬇️ Download
          </a>
        </div>

        {material.verificationStatus === 'approved' && (
          <div className="mt-4">
            <div className={`absolute ${material.linkedRequest ? 'top-32' : 'top-28'} right-4 flex flex-col gap-2`}>
              <button
                onClick={handleFavorite}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  isFavorited 
                    ? 'bg-yellow-400 hover:bg-yellow-500' 
                    : 'bg-gray-200 dark:bg-gray-700 olh-theme:bg-gray-200 hover:bg-yellow-100 dark:hover:bg-yellow-900 olh-theme:hover:bg-yellow-100'
                }`}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorited ? '⭐' : '☆'}
              </button>
              <button
                onClick={() => setShowReportDialog(true)}
                className="text-2xl p-2 bg-gray-200 dark:bg-gray-700 olh-theme:bg-gray-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 olh-theme:hover:bg-red-100"
                title="Report material"
              >
                🚩
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleVote('upvote')}
                disabled={isOwnMaterial || !user || hasVoted}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  hasVoted && hasUpvoted
                    ? 'bg-gray-400 dark:bg-gray-600 olh-theme:bg-gray-400 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 olh-theme:bg-gray-200 text-gray-700 dark:text-gray-300 olh-theme:text-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-gray-300'
                } ${(isOwnMaterial || !user || hasVoted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={
                  isOwnMaterial
                    ? "You can't vote on your own material"
                    : !user
                    ? "Login to vote"
                    : hasVoted
                    ? "You have already voted on this material"
                    : "Upvote"
                }
              >
                <span className="text-xl">👍</span>
              </button>

              <button
                onClick={() => handleVote('downvote')}
                disabled={isOwnMaterial || !user || hasVoted}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  hasVoted && hasDownvoted
                    ? 'bg-gray-400 dark:bg-gray-600 olh-theme:bg-gray-400 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 olh-theme:bg-gray-200 text-gray-700 dark:text-gray-300 olh-theme:text-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-gray-300'
                } ${(isOwnMaterial || !user || hasVoted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={
                  isOwnMaterial
                    ? "You can't vote on your own material"
                    : !user
                    ? "Login to vote"
                    : hasVoted
                    ? "You have already voted on this material"
                    : "Downvote"
                }
              >
                <span className="text-xl">👎</span>
              </button>
            </div>
          </div>
        )}

        {material.verificationStatus === 'pending' && isAdmin && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApprove}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => setShowRejectDialog(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              ❌ Reject
            </button>
          </div>
        )}

        {user && (isAdmin || isOwnMaterial) && (
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* SUCCESS TOAST */}
      {showReportSuccess && (
        <div className="fixed top-24 right-8 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl font-bold text-lg">
            Report submitted successfully! ✅
          </div>
        </div>
      )}

      {/* VOTE CONFIRMATION DIALOG */}
      {showVoteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 olh-theme:bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border-2 border-yellow-500">
            <h3 className="text-xl font-bold mb-4 dark:text-white olh-theme:text-gray-900">⚠️ Voting Confirmation</h3>
            <p className="text-gray-700 dark:text-gray-300 olh-theme:text-gray-700 mb-2">
              Please note:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 olh-theme:text-gray-600 mb-4 space-y-1">
              <li>You must <strong>view the PDF first</strong> before voting</li>
              <li>Your vote <strong>cannot be changed</strong> once cast</li>
              <li>Vote responsibly based on material quality</li>
            </ul>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowVoteDialog(false);
                  setPendingVote(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white olh-theme:text-gray-600 olh-theme:hover:text-gray-800 font-semibold"
              >
                Cancel
              </button>
              <a
                href={`${API_URL}${material.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={confirmVote}
                className="px-4 py-2 bg-blue-600 olh-theme:bg-olh-primary text-white rounded-lg hover:bg-blue-700 olh-theme:hover:bg-olh-hover font-semibold"
              >
                I Understand, Vote Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MATERIAL DIALOG - UPDATED */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 olh-theme:bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl border-2 border-red-500 dark:border-red-400 animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚩</div>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Report Material</h3>
              <p className="text-gray-700 dark:text-gray-300 olh-theme:text-gray-700">
                Report an issue with
              </p>
              <p className="text-gray-900 dark:text-white olh-theme:text-gray-900 font-bold mt-1">"{material.title}"</p>
            </div>
            
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Why are you reporting this material? (e.g., Inappropriate content, Wrong subject, Duplicate, etc.)"
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 olh-theme:border-gray-300 rounded-lg mb-4 dark:bg-gray-700 dark:text-white olh-theme:bg-white olh-theme:text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows="4"
            />

            <div className="bg-yellow-50 dark:bg-yellow-900/20 olh-theme:bg-yellow-50 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 olh-theme:text-yellow-800">
                ⚠️ Please provide a clear reason. Admins will review your report.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 olh-theme:bg-gray-200 text-gray-800 dark:text-white olh-theme:text-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 olh-theme:bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl border-2 border-red-500 dark:border-red-400 animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🗑️</div>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Delete Material?</h3>
              <p className="text-gray-700 dark:text-gray-300 olh-theme:text-gray-700 mb-1">
                Are you sure you want to delete
              </p>
              <p className="text-gray-900 dark:text-white olh-theme:text-gray-900 font-bold">"{material.title}"</p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 olh-theme:bg-red-50 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-300 olh-theme:text-red-800 font-semibold">
                ⚠️ This action cannot be undone!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 olh-theme:bg-gray-200 text-gray-800 dark:text-white olh-theme:text-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MATERIAL DIALOG */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 olh-theme:bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl border-2 border-orange-500 dark:border-orange-400 animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">Reject Material</h3>
              <p className="text-gray-700 dark:text-gray-300 olh-theme:text-gray-700">
                Provide a reason for rejecting
              </p>
              <p className="text-gray-900 dark:text-white olh-theme:text-gray-900 font-bold mt-1">"{material.title}"</p>
            </div>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (visible to uploader)..."
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 olh-theme:border-gray-300 rounded-lg mb-4 dark:bg-gray-700 dark:text-white olh-theme:bg-white olh-theme:text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              rows="4"
            />

            <div className="bg-yellow-50 dark:bg-yellow-900/20 olh-theme:bg-yellow-50 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 olh-theme:text-yellow-800">
                💬 The uploader will be notified with this reason
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 olh-theme:bg-gray-200 text-gray-800 dark:text-white olh-theme:text-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialCard;