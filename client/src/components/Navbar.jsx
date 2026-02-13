import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import Notifications from '../components/Notifications';

const Navbar = ({ user, setUser }) => {
  const [theme, setTheme] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    document.documentElement.classList.remove('dark', 'olh-theme');
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'olh') {
      document.documentElement.classList.add('olh-theme');
    }
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'olh'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % 3];
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  const getThemeIcon = () => {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '#';
  };

  const getThemeLabel = () => {
    if (theme === 'light') return 'Light';
    if (theme === 'dark') return 'Dark';
    return 'OLH 2.0';
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { data } = await axiosInstance.get('/api/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 olh-theme:bg-olh-bg shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 olh-theme:text-olh-light hover:scale-105 transition-transform" onClick={closeMenu}>
              OLH 2.0
            </Link>

            <div className="flex items-center gap-2">
              {/* Mobile Upload & Request Buttons - Icon only, next to hamburger */}
              {user && (
                <div className="md:hidden flex items-center gap-2">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openUploadModal'))}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-xl"
                    title="Upload Material"
                  >
                    📤
                  </button>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openRequestModal'))}
                    className="p-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors text-xl"
                    title="Request Material"
                  >
                    📝
                  </button>
                </div>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-700 olh-theme:bg-olh-card text-gray-700 dark:text-gray-300 olh-theme:text-olh-text hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-olh-primary transition-colors text-xl"
              >
                ☰
              </button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 olh-theme:bg-olh-card text-gray-800 dark:text-gray-200 olh-theme:text-olh-text rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-olh-primary transition-colors font-semibold">
                🏠 Home
              </Link>

              {user && (
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative px-4 py-2 bg-gray-200 dark:bg-gray-700 olh-theme:bg-olh-card text-gray-800 dark:text-gray-200 olh-theme:text-olh-text hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-olh-primary rounded-lg transition-colors"
                  title="Notifications"
                >
                  📬
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={cycleTheme}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 olh-theme:bg-olh-card text-gray-800 dark:text-gray-200 olh-theme:text-olh-text hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-olh-primary transition-colors font-semibold flex items-center gap-2"
                title={`Current: ${getThemeLabel()} - Click to switch`}
              >
                <span className="text-xl">{getThemeIcon()}</span>
                <span className="text-sm hidden lg:inline">{getThemeLabel()}</span>
              </button>

              {user && ['admin', 'master'].includes(user.role) && (
                <Link to="/admin" className="px-4 py-2 bg-indigo-200 dark:bg-indigo-800 olh-theme:bg-olh-primary text-indigo-800 dark:text-indigo-200 olh-theme:text-white rounded-lg hover:bg-indigo-300 dark:hover:bg-indigo-700 olh-theme:hover:bg-olh-dark transition-colors font-semibold">
                  ⚙️ Admin
                </Link>
              )}

              {user ? (
                <>
                  <Link to="/profile" className="text-gray-700 dark:text-gray-300 olh-theme:text-olh-accent hover:text-indigo-600 dark:hover:text-indigo-400 olh-theme:hover:text-olh-light font-semibold">
                    👤 {user.username}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 olh-theme:bg-olh-card text-gray-800 dark:text-gray-200 olh-theme:text-olh-text rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 olh-theme:hover:bg-red-600 olh-theme:hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 dark:text-gray-300 olh-theme:text-olh-accent hover:text-indigo-600 dark:hover:text-indigo-400 olh-theme:hover:text-olh-light font-semibold">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-2 bg-indigo-200 dark:bg-indigo-800 olh-theme:bg-olh-primary text-indigo-800 dark:text-indigo-200 olh-theme:text-white rounded-lg hover:bg-indigo-300 dark:hover:bg-indigo-700 olh-theme:hover:bg-olh-dark transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMenu}></div>
          
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 olh-theme:bg-olh-bg shadow-2xl transform transition-transform duration-300 ease-out flex flex-col">
            <div className="flex justify-end p-4">
              <button onClick={closeMenu} className="text-2xl text-gray-600 dark:text-gray-300 olh-theme:text-olh-text hover:text-red-500">
                ✖️
              </button>
            </div>

            {user ? (
              <>
                <div className="flex flex-col items-center py-6 border-b border-gray-200 dark:border-gray-700 olh-theme:border-olh-card">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 olh-theme:from-olh-primary olh-theme:to-olh-light flex items-center justify-center text-white font-bold text-4xl mb-3">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white olh-theme:text-olh-text">{user.username}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 olh-theme:text-olh-accent">{user.email}</p>
                  {user.role && (
                    <span className="mt-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 olh-theme:bg-olh-card text-indigo-600 dark:text-indigo-300 olh-theme:text-olh-light rounded-full text-xs font-semibold">
                      {user.role === 'master' ? '👑 Master' : user.role === 'admin' ? '⚡ Admin' : '👤 User'}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-2 p-4">
                  <Link to="/" onClick={closeMenu} className="w-full px-4 py-4 bg-gray-200 dark:bg-gray-700 olh-theme:bg-olh-card text-gray-800 dark:text-gray-200 olh-theme:text-olh-text rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-olh-primary transition-colors font-semibold text-left flex items-center gap-3">
                    <span className="text-xl">🏠</span> Home
                  </Link>

                  <button
                    onClick={() => {
                      closeMenu();
                      setShowNotifications(true);
                    }}
                    className="w-full px-4 py-4 bg-gray-200 dark:bg-gray-700 olh-theme:bg-olh-card text-gray-800 dark:text-gray-200 olh-theme:text-olh-text rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-olh-primary transition-colors font-semibold text-left flex items-center gap-3 relative"
                  >
                    <span className="text-xl">📬</span> Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <Link to="/profile" onClick={closeMenu} className="w-full px-4 py-4 bg-gray-200 dark:bg-gray-700 olh-theme:bg-olh-card text-gray-800 dark:text-gray-200 olh-theme:text-olh-text rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-olh-primary transition-colors font-semibold text-left flex items-center gap-3">
                    <span className="text-xl">👤</span> My Profile
                  </Link>

                  <button
                    onClick={cycleTheme}
                    className="w-full px-4 py-4 bg-gray-200 dark:bg-gray-700 olh-theme:bg-olh-card text-gray-800 dark:text-gray-200 olh-theme:text-olh-text rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-olh-primary transition-colors font-semibold text-left flex items-center gap-3"
                  >
                    <span className="text-xl">{getThemeIcon()}</span> {getThemeLabel()} Theme
                  </button>

                  {user && ['admin', 'master'].includes(user.role) && (
                    <Link to="/admin" onClick={closeMenu} className="w-full px-4 py-4 bg-indigo-200 dark:bg-indigo-800 olh-theme:bg-olh-primary text-indigo-800 dark:text-indigo-200 olh-theme:text-white rounded-lg hover:bg-indigo-300 dark:hover:bg-indigo-700 olh-theme:hover:bg-olh-dark transition-colors font-semibold text-left flex items-center gap-3">
                      <span className="text-xl">⚙️</span> Admin Dashboard
                    </Link>
                  )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 olh-theme:border-olh-card">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-4 bg-gray-300 dark:bg-gray-600 olh-theme:bg-olh-card text-gray-800 dark:text-gray-200 olh-theme:text-olh-text rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 olh-theme:hover:bg-red-600 olh-theme:hover:text-white transition-colors font-semibold flex items-center justify-center gap-3"
                  >
                    <span className="text-xl">🚪</span> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col gap-2 p-4">
                <Link to="/login" onClick={closeMenu} className="w-full px-4 py-4 bg-gray-200 dark:bg-gray-700 olh-theme:bg-olh-card text-gray-800 dark:text-gray-200 olh-theme:text-olh-text rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-olh-primary transition-colors font-semibold text-center">
                  Login
                </Link>
                <Link to="/register" onClick={closeMenu} className="w-full px-4 py-4 bg-indigo-200 dark:bg-indigo-800 olh-theme:bg-olh-primary text-indigo-800 dark:text-indigo-200 olh-theme:text-white rounded-lg hover:bg-indigo-300 dark:hover:bg-indigo-700 olh-theme:hover:bg-olh-dark transition-colors font-semibold text-center">
                  Register
                </Link>

                <button
                  onClick={cycleTheme}
                  className="w-full px-4 py-4 bg-gray-200 dark:bg-gray-700 olh-theme:bg-olh-card text-gray-800 dark:text-gray-200 olh-theme:text-olh-text rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 olh-theme:hover:bg-olh-primary transition-colors font-semibold text-center flex items-center justify-center gap-3"
                >
                  <span className="text-xl">{getThemeIcon()}</span> {getThemeLabel()} Theme
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Notifications 
        show={showNotifications} 
        onClose={() => {
          setShowNotifications(false);
          fetchUnreadCount();
        }} 
      />
    </>
  );
};

export default Navbar;