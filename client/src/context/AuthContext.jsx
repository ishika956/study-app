import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem('study_user');
    const storedToken = localStorage.getItem('study_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('study_user');
        localStorage.removeItem('study_token');
      }
    }

    setLoading(false);
  }, []);

  // LOGIN
  const login = async (email, password) => {
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      localStorage.setItem('study_token', token);
      localStorage.setItem('study_user', JSON.stringify(userData));

      setUser(userData);

      toast.success('Successfully logged in!', {
        id: 'auth-toast',
      });

      return { success: true };

    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Login failed. Please check credentials.';

      toast.error(message, {
        id: 'auth-toast',
      });

      return {
        success: false,
        error: message,
      };

    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const register = async (email, password) => {
    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      localStorage.setItem('study_token', token);
      localStorage.setItem('study_user', JSON.stringify(userData));

      setUser(userData);

      toast.success('Account created successfully!', {
        id: 'auth-toast',
      });

      return { success: true };

    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Registration failed.';

      toast.error(message, {
        id: 'auth-toast',
      });

      return {
        success: false,
        error: message,
      };

    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('study_token');
    localStorage.removeItem('study_user');

    setUser(null);

    toast.success('Logged out successfully!', {
      id: 'auth-toast',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);