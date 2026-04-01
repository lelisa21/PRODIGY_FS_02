import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login, logout, register, updateProfile } = useAuthStore();
  const { success: showSuccess, error: showError } = useToast();

  const handleLogin = useCallback(async (email, password, rememberMe) => {
    const result = await login(email, password, rememberMe);
    if (result.success) {
      showSuccess('Welcome back! Login successful');
      navigate('/app/dashboard');
      return true;
    } else {
      showError(result.error || 'Login failed');
      return false;
    }
  }, [login, navigate, showSuccess, showError]);

  const handleLogout = useCallback(async () => {
    await logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  }, [logout, navigate, showSuccess]);

  const handleRegister = useCallback(async (userData) => {
    const result = await register(userData);
    if (result.success) {
      showSuccess('Account created successfully! Please login');
      navigate('/login');
      return true;
    } else {
      showError(result.error || 'Registration failed');
      return false;
    }
  }, [register, navigate, showSuccess, showError]);

  const handleUpdateProfile = useCallback(async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      showSuccess('Profile updated successfully');
      return true;
    } else {
      showError(result.error || 'Update failed');
      return false;
    }
  }, [updateProfile, showSuccess, showError]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    updateProfile: handleUpdateProfile,
  };
};
