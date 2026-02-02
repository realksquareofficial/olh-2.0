import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';


export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);


  const fetchUser = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error('Fetch user error:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };


  const login = async (credentials) => {
    try {
      console.log('Logging in with:', credentials);
      const res = await axios.post(`${API_URL}/api/auth/login`, credentials);
      console.log('Login response:', res.data);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      return false;
    }
  };


  const register = async (userData) => {
    try {
      console.log('Registering with:', userData);
      const res = await axios.post(`${API_URL}/api/auth/register`, userData);
      console.log('Register response:', res.data);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      console.error('Register error:', err.response?.data || err.message);
      return false;
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }


  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};