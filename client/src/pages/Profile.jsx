import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import { AuthContext } from '../context/AuthContext';
import MaterialCard from '../components/MaterialCard';


const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('uploaded');
  const [uploadedMaterials, setUploadedMaterials] = useState([]);
  const [favoriteMaterials, setFavoriteMaterials] = useState([]);
  const [stats, setStats] = useState({ uploadedCount: 0, favoritesCount: 0 });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);


  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const profileRes = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
       });
      setStats(profileRes.data.stats);


      const uploadedRes = await axios.get(`${API_URL}/api/users/my-materials`, {
        headers: { Authorization: `Bearer ${token}` }
       });
      setUploadedMaterials(uploadedRes.data);


      const favoritesRes = await axios.get(`${API_URL}/api/materials/favorites/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoriteMaterials(favoritesRes.data);


      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };


  const getRoleBadge = () => {
    if (user?.role === 'master') return { icon: '👑', text: 'Master', color: 'from-yellow-400 to-orange-500' };
    if (user?.role === 'admin') return { icon: '⚡', text: 'Admin', color: 'from-purple-400 to-indigo-500' };
    return { icon: '👤', text: 'User', color: 'from-blue-400 to-indigo-500' };
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600 dark:text-gray-400 animate-pulse">Loading... ⏳</div>
      </div>
    );
  }


  const roleBadge = getRoleBadge();


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
              <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${roleBadge.color} flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white dark:border-gray-800`}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              <div className="flex-1 md:mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {user?.username}
                  </h1>
                  <span className="text-2xl">{roleBadge.icon}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{user?.email}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${roleBadge.color} text-white`}>
                  {roleBadge.text}
                </span>
              </div>
            </div>


            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-4 text-center border border-indigo-200 dark:border-indigo-700">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.uploadedCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Materials Uploaded</div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-xl p-4 text-center border border-pink-200 dark:border-pink-700">
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{stats.favoritesCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Favorites</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-700 col-span-2 md:col-span-1">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {uploadedMaterials.reduce((sum, m) => sum + (m.views || 0), 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Views</div>
              </div>
            </div>
          </div>
        </div>


        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3 md:flex md:gap-0 md:border-b md:border-gray-300 md:dark:border-gray-700">
            <button
              onClick={() => setActiveTab('uploaded')}
              className={`flex items-center justify-center gap-2 px-4 py-4 md:py-3 font-semibold transition-all duration-200 rounded-lg md:rounded-none ${
                activeTab === 'uploaded'
                  ? 'bg-indigo-500 text-white md:bg-transparent md:border-b-4 md:border-indigo-600 md:text-indigo-600 md:dark:text-indigo-400 shadow-md md:shadow-none'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 md:bg-transparent md:hover:text-indigo-600 md:dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 md:border-0'
              }`}
            >
              <span className="text-xl md:text-base">📤</span>
              <span>My Uploads</span>
              <span className="text-sm opacity-75">({uploadedMaterials.length})</span>
            </button>
            
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center justify-center gap-2 px-4 py-4 md:py-3 font-semibold transition-all duration-200 rounded-lg md:rounded-none ${
                activeTab === 'favorites'
                  ? 'bg-pink-500 text-white md:bg-transparent md:border-b-4 md:border-pink-600 md:text-pink-600 md:dark:text-pink-400 shadow-md md:shadow-none'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 md:bg-transparent md:hover:text-pink-600 md:dark:hover:text-pink-400 border border-gray-200 dark:border-gray-700 md:border-0'
              }`}
            >
              <span className="text-xl md:text-base">❤️</span>
              <span>Favorites</span>
              <span className="text-sm opacity-75">({favoriteMaterials.length})</span>
            </button>
          </div>
        </div>


        {activeTab === 'uploaded' && (
          <div>
            {uploadedMaterials.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No uploads yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Share your knowledge with the community!</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Upload Your First Material 🚀
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploadedMaterials.map((material) => (
                  <MaterialCard key={material._id} material={material} onUpdate={fetchProfile} />
                ))}
              </div>
            )}
          </div>
        )}


        {activeTab === 'favorites' && (
          <div>
            {favoriteMaterials.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Start saving materials you love!</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Browse Materials 📚
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteMaterials.map((material) => (
                  <MaterialCard key={material._id} material={material} onUpdate={fetchProfile} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


export default Profile;