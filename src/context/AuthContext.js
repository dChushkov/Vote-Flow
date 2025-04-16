import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      setAuthToken(token);
    }
    setLoading(false);
  }, []);

  // Set axios auth token for all requests
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post(
        'http://localhost:5000/api/users/register', 
        userData
      );

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: res.data._id,
          name: res.data.name,
          email: res.data.email
        }));

        setAuthToken(res.data.token);
        setUser({
          id: res.data._id,
          name: res.data.name,
          email: res.data.email
        });
        setIsAuthenticated(true);
        setError(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'An error occurred during registration'
      );
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post(
        'http://localhost:5000/api/users/login', 
        userData
      );

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: res.data._id,
          name: res.data.name,
          email: res.data.email
        }));

        setAuthToken(res.data.token);
        setUser({
          id: res.data._id,
          name: res.data.name,
          email: res.data.email
        });
        setIsAuthenticated(true);
        setError(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Invalid credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 