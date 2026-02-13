import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const Reports = () => {
  const [reportedMaterials, setReportedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showIgnoreDialog, setShowIgnoreDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successText, setSuccessText] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axiosInstance.get('/api/materials/reports/all');
      setReportedMaterials(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDeleteClick = (material) => {
    setSelectedMaterial(material);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedMaterial) return;

    try {
      await axiosInstance.delete(`/api/materials/${selectedMaterial._id}`);
      setShowDeleteDialog(false);
      setSelectedMaterial(null);
      
      // Show success message
      setSuccessText('Material deleted successfully! ✅');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      fetchReports();
    } catch (err) {
      console.error(err);
      setSuccessText('Failed to delete material! ❌');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const handleIgnoreClick = (material) => {
    setSelectedMaterial(material);
    setShowIgnoreDialog(true);
  };

  const confirmIgnore = async () => {
    if (!selectedMaterial) return;

    try {
      await axiosInstance.patch(`/api/materials/${selectedMaterial._id}/ignore-reports`, {});
      setShowIgnoreDialog(false);
      setSelectedMaterial(null);
      
      // Show success message
      setSuccessText('Reports cleared successfully! ✅');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      fetchReports();
    } catch (err) {
      console.error(err);
      setSuccessText('Failed to clear reports! ❌');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  if (loading) {
    return <div className="text-center text-2xl mt-20">Loading...</div>;
  }

  if (reportedMaterials.length === 0) {
    return <div className="text-center text-2xl mt-20">No reports! 🎉</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-red-500 mb-8">🚩 Reported Materials ({reportedMaterials.length})</h1>

        <div className="space-y-6">
          {reportedMaterials.map((material) => (
            <div key={material._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-4 border-red-500 p-8">
              
              {/* MATERIAL HEADER */}
              <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-gray-300 dark:border-gray-600">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{material.title}</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    by <span className="font-semibold">{material.uploadedBy?.username || 'Unknown'}</span> • {material.subject}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold mb-2">
                    {material.verificationStatus.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {material.views} views • Score: {material.trustScore}
                  </div>
                </div>
              </div>

              {/* REPORTS LIST */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-red-600 mb-4">📋 Reports ({material.reports.length})</h3>
                <div className="space-y-4">
                  {material.reports.map((report, idx) => (
                    <div key={idx} className="bg-red-50 dark:bg-red-900/30 p-5 rounded-xl border-2 border-red-300 dark:border-red-700">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          {report.reportedBy?.username || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-lg">{report.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => handleIgnoreClick(material)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  ✅ Ignore Reports
                </button>
                <button
                  onClick={() => handleDeleteClick(material)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  🗑️ Delete Material
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* SUCCESS/ERROR MESSAGE TOAST */}
      {showSuccessMessage && (
        <div className="fixed top-24 right-8 z-50 animate-fade-in">
          <div className={`${
            successText.includes('✅') 
              ? 'bg-green-500' 
              : 'bg-red-500'
          } text-white px-6 py-4 rounded-xl shadow-2xl font-bold text-lg`}>
            {successText}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {showDeleteDialog && selectedMaterial && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-red-500">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Delete Material Permanently?</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Are you sure you want to delete:
              </p>
              <p className="text-gray-900 dark:text-white font-bold text-lg">"{selectedMaterial.title}"</p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-300 font-semibold">
                ⚠️ This action cannot be undone! The material will be permanently removed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedMaterial(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IGNORE REPORTS CONFIRMATION DIALOG */}
      {showIgnoreDialog && selectedMaterial && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-blue-500">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">Ignore All Reports?</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Clear all reports for:
              </p>
              <p className="text-gray-900 dark:text-white font-bold text-lg">"{selectedMaterial.title}"</p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 This will clear all {selectedMaterial.reports.length} report(s) and keep the material live.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowIgnoreDialog(false);
                  setSelectedMaterial(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmIgnore}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Ignore Reports
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reports;