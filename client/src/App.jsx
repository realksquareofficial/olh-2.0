import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from './utils/axios';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import OfflineAlert from './components/OfflineAlert';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axiosInstance.get('/api/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error(err);
          localStorage.removeItem('token');
        }
      }
      
      // Minimum 1.5s splash screen for smooth UX
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    };

    loadApp();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <OfflineAlert />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 olh-theme:bg-olh-bg transition-colors duration-300">
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/admin" element={user && ['admin', 'master'].includes(user.role) ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;