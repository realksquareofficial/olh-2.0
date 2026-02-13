import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const Reports = () => {
  const [reportedMaterials, setReportedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (materialId) => {
    if (!window.confirm('⚠️ DELETE this material permanently?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/materials/${materialId}`);
      alert('Deleted! ✅');
      fetchReports();
    } catch (err) {
      console.error(err);
      alert('Failed!');
    }
  };

  const handleIgnore = async (materialId) => {
    if (!window.confirm('Clear all reports?')) {
      return;
    }

    try {
      await axiosInstance.patch(`/api/materials/${materialId}/ignore-reports`, {});
      alert('Reports cleared! ✅');
      fetchReports();
    } catch (err) {
      console.error(err);
      alert('Failed!');
    }
  };

  if (loading) {
    return <div className="text-center text-2xl mt-20">Loading...</div>;
  }

  if (reportedMaterials.length === 0) {
    return <div className="text-center text-2xl mt-20">No reports! 🎉</div>;
  }

  return (
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

            {/* ACTION BUTTONS - RIGHT HERE! */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => handleIgnore(material._id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                ✅ Ignore Reports
              </button>
              <button
                onClick={() => handleDelete(material._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                🗑️ Delete Material
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;