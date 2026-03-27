import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: true,
      isLoading: false,
      error: null,

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          if (rememberMe) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed',
          });
          return {
            success: false,
            error: error.response?.data?.message || 'Login failed',
          };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/signup', userData);
          set({ isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed',
          });
          return {
            success: false,
            error: error.response?.data?.message || 'Registration failed',
          };
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.patch('/auth/profile', data);
          set({
            user: response.data.user,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Update failed',
          });
          return {
            success: false,
            error: error.response?.data?.message || 'Update failed',
          };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
