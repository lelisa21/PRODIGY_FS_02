import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { 
            email, 
            password, 
            rememberMe: Boolean(rememberMe) 
          });
          
          const { user, accessToken } = response.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          console.error('Login error:', error.response?.data);
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return {
            success: false,
            error: errorMessage,
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
          
          if (response.data.success) {
            set({ 
              isLoading: false,
              error: null,
            });
            return { 
              success: true, 
              data: response.data.data,
              message: response.data.message 
            };
          } else {
            throw new Error(response.data.message || 'Registration failed');
          }
        } catch (error) {
          console.error('Registration error:', error.response?.data);
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return {
            success: false,
            error: errorMessage,
          };
        }
      },


updateProfile: async (data) => {
  set({ isLoading: true, error: null });
  try {
    const response = await api.patch('/auth/profile', data);
        
    const updatedUser = response.data?.data || response.data;
    
    if (!updatedUser) {
      throw new Error('No user data returned from server');
    }
    
    // Get current user
    const currentUser = get().user;
        const mergedUser = {
      ...currentUser,
      ...updatedUser,
      profile: {
        ...currentUser?.profile,
        ...updatedUser?.profile
      },
      employeeData: {
        ...currentUser?.employeeData,
        ...updatedUser?.employeeData
      }
    };
        
    set({
      user: mergedUser,
      isLoading: false,
      error: null,
    });
    
    const storedData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    localStorage.setItem('auth-storage', JSON.stringify({
      ...storedData,
      state: {
        ...storedData.state,
        user: mergedUser,
        isAuthenticated: true
      }
    }));
    
    return { success: true, data: mergedUser };
  } catch (error) {
    console.error('Update profile error:', error.response?.data);
    const errorMessage = error.response?.data?.message || 'Update failed';
    set({
      isLoading: false,
      error: errorMessage,
    });
    return {
      success: false,
      error: errorMessage,
    };
  }
},

      checkAuth: async () => {
        set({ isLoading: true });
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return false;
        }
        
        try {
          const response = await api.get('/auth/profile');
          set({
            user: response.data.data,
            isAuthenticated: true,
            error: null,
            isLoading: false,
          });
          return true;
        } catch (error) {
          // Token is invalid
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
