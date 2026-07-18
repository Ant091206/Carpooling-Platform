import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth.service.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token) {
        try {
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
          // Fetch freshest user status from database on start
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
        } catch (error) {
          console.error('Failed to parse saved auth profile / verify identity:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please verify credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      await authService.register(userData);
      // Immediately call login with same email and password
      const loggedUser = await authService.login(userData.email, userData.password);
      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const registerCompany = async (companyData) => {
    setLoading(true);
    try {
      await authService.registerCompany(companyData);
      // Immediately login using the newly created admin account
      const loggedUser = await authService.login(companyData.admin_email, companyData.admin_password);
      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Company registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const lookupCompany = async (code) => {
    try {
      return await authService.lookupCompany(code);
    } catch (error) {
      return null;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error.message);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed.'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    registerCompany,
    lookupCompany,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider wrapper');
  }
  return context;
};
