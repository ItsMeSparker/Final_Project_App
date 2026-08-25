import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
          // Verify token and fetch user details
          const response = await api.get('/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        console.log('Error loading user', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

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
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const signup = async (email, password) => {
    try {
      await api.post('/auth/signup', { email, password });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Signup failed' };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
