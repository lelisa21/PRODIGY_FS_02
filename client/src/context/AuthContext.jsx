import { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToast } from './ToastContext';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login, demoLogin, logout, register, updateProfile, checkAuth } = useAuthStore();
  const { success: showSuccess, error: showError } = useToast();

  const handleLogin = useCallback(async (email, password, rememberMe = false) => {
    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        showSuccess('Welcome back! Login successful');
        navigate('/app/dashboard');
        return { success: true };
      } else {
        showError(result.error || 'Login failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showError('An unexpected error occurred');
      return { success: false, error: error.message };
    }
  }, [login, navigate, showSuccess, showError]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
      navigate('/login');
    } catch (error) {
      showError('Logout failed');
    }
  }, [logout, navigate, showSuccess, showError]);

  const handleDemoLogin = useCallback(async () => {
    try {
      const result = await demoLogin();
      if (result.success) {
        showSuccess('Demo workspace loaded');
        navigate('/app/dashboard?demo=1');
        return { success: true };
      }

      showError(result.error || 'Demo login failed');
      return { success: false, error: result.error };
    } catch (error) {
      showError('An unexpected error occurred');
      return { success: false, error: error.message };
    }
  }, [demoLogin, navigate, showSuccess, showError]);

  const handleRegister = useCallback(async (userData) => {
    try {
      const result = await register(userData);
      if (result.success) {
        showSuccess('Account created successfully! Please login');
        navigate('/login');
        return { success: true };
      } else {
        showError(result.error || 'Registration failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showError('An unexpected error occurred');
      return { success: false, error: error.message };
    }
  }, [register, navigate, showSuccess, showError]);

  const handleUpdateProfile = useCallback(async (data) => {
    try {
      const result = await updateProfile(data);
      if (result.success) {
        showSuccess('Profile updated successfully');
        return { success: true };
      } else {
        showError(result.error || 'Update failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showError('An unexpected error occurred');
      return { success: false, error: error.message };
    }
  }, [updateProfile, showSuccess, showError]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    demoLogin: handleDemoLogin,
    logout: handleLogout,
    register: handleRegister,
    updateProfile: handleUpdateProfile,
  }), [user, isAuthenticated, isLoading, handleLogin, handleDemoLogin, handleLogout, handleRegister, handleUpdateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
