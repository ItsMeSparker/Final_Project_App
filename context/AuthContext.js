import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import api from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setToken(null);
    setUser(null);
  }, []);

  // Automatically log out and return to login page whenever any request returns 401
  useEffect(() => {
    const handleUnauthorized = async (error) => {
      const requestUrl = error.config?.url || '';
      if (error.response?.status === 401 && !requestUrl.includes('/auth/login')) {
        await logout();
      }
      return Promise.reject(error);
    };

    const axiosInterceptor = axios.interceptors.response.use(
      (response) => response,
      handleUnauthorized
    );
    const apiInterceptor = api.interceptors.response.use(
      (response) => response,
      handleUnauthorized
    );

    return () => {
      axios.interceptors.response.eject(axiosInterceptor);
      api.interceptors.response.eject(apiInterceptor);
    };
  }, [logout]);

  // Load user on startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('access_token');
        if (storedToken) {
          // Verify token and fetch user details
          const response = await api.get('/auth/me');
          setUser(response.data);
          setToken(storedToken);
        }
      } catch (error) {
        console.log('Session expired or invalid on startup, redirecting to login.');
        await logout();
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, [logout]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', 
        `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      
      const { access_token, refresh_token } = response.data;
      await SecureStore.setItemAsync('access_token', access_token);
      await SecureStore.setItemAsync('refresh_token', refresh_token);
      
      // Fetch user details
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      setToken(access_token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const signup = async (email, username, password) => {
    try {
      await api.post('/auth/signup', { email, username, password });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Signup failed' };
    }
  };

  const updateUsername = async (newUsername) => {
    try {
      const response = await api.put('/auth/me', { username: newUsername });
      setUser(response.data);
      return { success: true };
    } catch (error) {
      if (error.response?.status === 401) {
        return { success: false, unauthorized: true };
      }
      return { success: false, error: error.response?.data?.detail || 'Failed to update username' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
  try {
    await api.put('/auth/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return { success: true };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: false, unauthorized: true };
    }
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to update password',
    };
  }
};

  return (
    <AuthContext.Provider value={{ user, isLoading, token, login, signup, updateUsername, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
