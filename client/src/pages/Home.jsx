import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import MaterialCard from '../components/MaterialCard';
import SearchBar from '../components/SearchBar';
import RequestForm from '../components/RequestForm';
import RequestCard from '../components/RequestCard';
import Reports from './Reports';

const Home = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [materials, setMaterials] = useState([]);
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState('public');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const isAdmin = user && ['admin', 'master'].includes(user.role);

  useEffect(() => {
    fetchMaterials();
    fetchRequests();
    if (isAdmin) {
      fetchPendingMaterials();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (location.state?.fulfillRequestId) {
      const request = requests.find(r => r._id === location.state.fulfillRequestId);
      if (request) {
        setSelectedRequest(request);
        setShowUploadModal(true);
      }
    }
  }, [location.state, requests]);

  useEffect(() => {
    const handleOpenUpload = () => {
      setSelectedRequest(null);
      setShowUploadModal(true);
    };

    const handleOpenRequest = () => {
      setShowRequestModal(true);
    };

    window.addEventListener('openUploadModal', handleOpenUpload);
    window.addEventListener('openRequestModal', handleOpenRequest);

    return () => {
      window.removeEventListener('openUploadModal', handleOpenUpload);
      window.removeEventListener('openRequestModal', handleOpenRequest);
    };
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axiosInstance.get('/api/materials');
      setMaterials(res.data);
      setFilteredMaterials(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get('/api/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingMaterials = async () => {
    try {
      const res = await axiosInstance.get('/api/materials/pending/all');
      setPendingMaterials(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSuccess = () => {
    fetchMaterials();
    fetchRequests();
    setShowUploadModal(false);
    setSelectedRequest(null);
  };

  const handleRequestSuccess = () => {
    fetchRequests();
    setShowRequestModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {user && (
        <>
          <button
            onClick={() => {
              setSelectedRequest(null);
              setShowUploadModal(true);
            }}
            className="hidden md:flex fixed bottom-24 right-8 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white px-6 py-4 rounded-tl-2xl rounded-br-2xl shadow-lg transition-all duration-200 hover:-translate-y-1 z-50 items-center gap-2 font-bold"
          >
            <span className="text-xl">📤</span>
            Upload
          </button>

          <button
            onClick={() => setShowRequestModal(true)}
            className="hidden md:flex fixed bottom-8 right-8 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-6 py-4 rounded-tl-2xl rounded-br-2xl shadow-lg transition-all duration-200 hover:-translate-y-1 z-50 items-center gap-2 font-bold"
          >
            <span className="text-xl">📝</span>
            Request
          </button>
        </>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl border-2 border-sky-200 dark:border-sky-900">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setSelectedRequest(null);
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-2xl font-bold z-10"
            >
              ✕
            </button>
            <div className="p-8">
              <UploadForm onUploadSuccess={handleUploadSuccess} linkedRequest={selectedRequest} />
            </div>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl border-2 border-orange-200 dark:border-orange-900">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-2xl font-bold z-10"
            >
              ✕
            </button>
            <div className="p-8">
              <RequestForm onRequestSuccess={handleRequestSuccess} />
            </div>
          </div>
        </div>
      )}

      <SearchBar materials={materials} setFilteredMaterials={setFilteredMaterials} />

      <div className="mb-8">
        <div className={`grid ${isAdmin ? 'grid-cols-4' : 'grid-cols-2'} gap-2 md:flex md:gap-6`}>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex items-center justify-center gap-2 px-5 py-4 font-bold transition-all duration-200 ${
              activeTab === 'public'
                ? 'bg-sky-600 dark:bg-sky-500 text-white rounded-xl md:rounded-none md:bg-transparent md:text-sky-600 dark:md:text-sky-400 md:border-b-4 md:border-sky-600 dark:md:border-sky-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl md:rounded-none md:bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 md:hover:bg-transparent md:hover:text-sky-600 dark:md:hover:text-sky-400'
            }`}
          >
            <span className="text-lg">📚</span>
            <span className="text-sm md:text-base">Public Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center justify-center gap-2 px-5 py-4 font-bold transition-all duration-200 relative ${
              activeTab === 'requests'
                ? 'bg-orange-600 dark:bg-orange-500 text-white rounded-xl md:rounded-none md:bg-transparent md:text-orange-600 dark:md:text-orange-400 md:border-b-4 md:border-orange-600 dark:md:border-orange-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl md:rounded-none md:bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 md:hover:bg-transparent md:hover:text-orange-600 dark:md:hover:text-orange-400'
            }`}
          >
            <span className="text-lg">📝</span>
            <span className="text-sm md:text-base">Requests</span>
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {requests.length}
              </span>
            )}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center justify-center gap-2 px-5 py-4 font-bold transition-all duration-200 relative ${
                  activeTab === 'pending'
                    ? 'bg-amber-500 text-white rounded-xl md:rounded-none md:bg-transparent md:text-amber-600 dark:md:text-amber-400 md:border-b-4 md:border-amber-500'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl md:rounded-none md:bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 md:hover:bg-transparent md:hover:text-amber-600 dark:md:hover:text-amber-400'
                }`}
              >
                <span className="text-lg">📋</span>
                <span className="text-sm md:text-base">Pending</span>
                {pendingMaterials.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {pendingMaterials.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center justify-center gap-2 px-5 py-4 font-bold transition-all duration-200 ${
                  activeTab === 'reports'
                    ? 'bg-red-500 text-white rounded-xl md:rounded-none md:bg-transparent md:text-red-600 dark:md:text-red-400 md:border-b-4 md:border-red-500'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl md:rounded-none md:bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 md:hover:bg-transparent md:hover:text-red-600 dark:md:hover:text-red-400'
                }`}
              >
                <span className="text-lg">🚩</span>
                <span className="text-sm md:text-base">Reports</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'public' && (
        <div>
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-6 opacity-50">📚</div>
              <p className="text-gray-600 dark:text-gray-400 text-2xl font-bold mb-6">No materials found</p>
              {user && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 hover:-translate-y-1 shadow-lg"
                >
                  Be the first to upload
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <MaterialCard key={material._id} material={material} onUpdate={fetchMaterials} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-6 opacity-50">📝</div>
              <p className="text-gray-600 dark:text-gray-400 text-2xl font-bold mb-6">No active requests</p>
              {user && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 hover:-translate-y-1 shadow-lg"
                >
                  Create first request
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <RequestCard key={request._id} request={request} onUpdate={fetchRequests} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && isAdmin && (
        <div>
          {pendingMaterials.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-6">✅</div>
              <p className="text-gray-600 dark:text-gray-400 text-2xl font-bold">All caught up</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingMaterials.map((material) => (
                <MaterialCard
                  key={material._id}
                  material={material}
                  onUpdate={() => {
                    fetchMaterials();
                    fetchPendingMaterials();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && isAdmin && <Reports />}
    </div>
  );
};

export default Home;