import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import MaterialCard from '../components/MaterialCard';
import SearchBar from '../components/SearchBar';
import RequestForm from '../components/RequestForm';
import RequestCard from '../components/RequestCard';
import Reports from './Reports';
import API_URL from '../config/api';

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

  // Listen to events from Navbar buttons
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
      const res = await axios.get(`${API_URL}/api/materials`);
      setMaterials(res.data);
      setFilteredMaterials(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/requests`);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/materials/pending/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      {/* Desktop Floating Buttons - Only visible on desktop */}
      {user && (
        <>
          <button
            onClick={() => {
              setSelectedRequest(null);
              setShowUploadModal(true);
            }}
            className="hidden md:flex fixed bottom-24 right-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 z-50 items-center gap-2"
            title="Upload Material"
          >
            <span className="text-2xl">📤</span>
            <span className="font-bold">Upload</span>
          </button>

          <button
            onClick={() => setShowRequestModal(true)}
            className="hidden md:flex fixed bottom-8 right-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 z-50 items-center gap-2"
            title="Request Material"
          >
            <span className="text-2xl">📝</span>
            <span className="font-bold">Request</span>
          </button>
        </>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 olh-theme:bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setSelectedRequest(null);
              }}
              className="absolute top-4 right-4 text-3xl hover:text-red-500 transition-colors z-10"
            >
              ❌
            </button>
            <div className="p-6">
              <UploadForm onUploadSuccess={handleUploadSuccess} linkedRequest={selectedRequest} />
            </div>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 olh-theme:bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 text-3xl hover:text-red-500 transition-colors z-10"
            >
              ❌
            </button>
            <div className="p-6">
              <RequestForm onRequestSuccess={handleRequestSuccess} />
            </div>
          </div>
        </div>
      )}

      <SearchBar materials={materials} setFilteredMaterials={setFilteredMaterials} />

      <div className="mb-6">
        <div className={`grid ${isAdmin ? 'grid-cols-4' : 'grid-cols-2'} gap-3 md:flex md:gap-4 md:border-b md:border-gray-300 md:dark:border-gray-700 olh-theme:md:border-olh-primary`}>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex flex-col md:flex-row items-center justify-center gap-2 px-4 py-4 md:py-3 font-semibold transition-all duration-200 rounded-lg md:rounded-none ${
              activeTab === 'public'
                ? 'bg-indigo-500 text-white md:bg-transparent md:border-b-4 md:border-indigo-600 md:text-indigo-600 md:dark:text-indigo-400 olh-theme:md:text-olh-primary'
                : 'bg-gray-100 dark:bg-gray-700 olh-theme:bg-gray-200 text-gray-600 dark:text-gray-400 olh-theme:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 olh-theme:hover:bg-gray-300 md:bg-transparent md:hover:text-indigo-600 md:dark:hover:text-indigo-400 olh-theme:md:hover:text-olh-primary'
            }`}
          >
            <span className="text-2xl md:text-base">📚</span>
            <span className="text-sm md:text-base">Public Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex flex-col md:flex-row items-center justify-center gap-2 px-4 py-4 md:py-3 font-semibold transition-all duration-200 relative rounded-lg md:rounded-none ${
              activeTab === 'requests'
                ? 'bg-orange-500 text-white md:bg-transparent md:border-b-4 md:border-orange-600 md:text-orange-600 md:dark:text-orange-400 olh-theme:md:text-orange-600'
                : 'bg-gray-100 dark:bg-gray-700 olh-theme:bg-gray-200 text-gray-600 dark:text-gray-400 olh-theme:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 olh-theme:hover:bg-gray-300 md:bg-transparent md:hover:text-orange-600 md:dark:hover:text-orange-400 olh-theme:md:hover:text-orange-600'
            }`}
          >
            <span className="text-2xl md:text-base">📝</span>
            <span className="text-sm md:text-base">Requests</span>
            {requests.length > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {requests.length}
              </span>
            )}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex flex-col md:flex-row items-center justify-center gap-2 px-4 py-4 md:py-3 font-semibold transition-all duration-200 relative rounded-lg md:rounded-none ${
                  activeTab === 'pending'
                    ? 'bg-yellow-500 text-white md:bg-transparent md:border-b-4 md:border-yellow-500 md:text-yellow-600 md:dark:text-yellow-400 olh-theme:md:text-yellow-600'
                    : 'bg-gray-100 dark:bg-gray-700 olh-theme:bg-gray-200 text-gray-600 dark:text-gray-400 olh-theme:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 olh-theme:hover:bg-gray-300 md:bg-transparent md:hover:text-yellow-600 md:dark:hover:text-yellow-400 olh-theme:md:hover:text-yellow-600'
                }`}
              >
                <span className="text-2xl md:text-base">📋</span>
                <span className="text-sm md:text-base">Pending</span>
                {pendingMaterials.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {pendingMaterials.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex flex-col md:flex-row items-center justify-center gap-2 px-4 py-4 md:py-3 font-semibold transition-all duration-200 rounded-lg md:rounded-none ${
                  activeTab === 'reports'
                    ? 'bg-red-500 text-white md:bg-transparent md:border-b-4 md:border-red-500 md:text-red-600 md:dark:text-red-400 olh-theme:md:text-red-600'
                    : 'bg-gray-100 dark:bg-gray-700 olh-theme:bg-gray-200 text-gray-600 dark:text-gray-400 olh-theme:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 olh-theme:hover:bg-gray-300 md:bg-transparent md:hover:text-red-600 md:dark:hover:text-red-400 olh-theme:md:hover:text-red-600'
                }`}
              >
                <span className="text-2xl md:text-base">🚩</span>
                <span className="text-sm md:text-base">Reports</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'public' && (
        <div>
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 dark:text-gray-400 olh-theme:text-gray-600 text-xl mb-4">No materials found</p>
              {user && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 olh-theme:bg-olh-primary olh-theme:hover:bg-olh-hover text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Be the first to upload! 📤
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
            <div className="text-center py-16">
              <p className="text-gray-600 dark:text-gray-400 olh-theme:text-gray-600 text-xl mb-4">No active requests</p>
              {user && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Create First Request! 📝
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
            <p className="text-gray-600 dark:text-gray-400 olh-theme:text-gray-600 text-center py-8">No pending materials 😎</p>
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

      {activeTab === 'reports' && isAdmin && (
        <Reports />
      )}
    </div>
  );
};

export default Home;