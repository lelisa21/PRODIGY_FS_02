import { create } from 'zustand';
import dashboardService from '../services/dashboard.service';

export const useDashboardStore = create((set, get) => ({
  stats: null,
  performance: null,
  salaryDistribution: null,
  recentActivity: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const results = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getPerformance(),
        dashboardService.getSalaryDistribution(),
        dashboardService.getRecentActivity(),
      ]);

      const [statsRes, performanceRes, salaryRes, activityRes] = results;
      const stats = statsRes.status === 'fulfilled' ? statsRes.value : null;
      const performance = performanceRes.status === 'fulfilled' ? performanceRes.value : null;
      const salaryDistribution = salaryRes.status === 'fulfilled' ? salaryRes.value : null;
      const recentActivity = activityRes.status === 'fulfilled' ? activityRes.value : null;
      
      set({
        stats: stats?.data || null,
        performance: performance?.data || null,
        salaryDistribution: salaryDistribution?.data || null,
        recentActivity: recentActivity?.data || [],
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard data',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard data',
      };
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardService.getStats();
      set({
        stats: response.data,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch stats',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch stats',
      };
    }
  },

  fetchPerformance: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardService.getPerformance();
      set({
        performance: response.data,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch performance data',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch performance data',
      };
    }
  },

  fetchSalaryDistribution: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardService.getSalaryDistribution();
      set({
        salaryDistribution: response.data,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch salary distribution',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch salary distribution',
      };
    }
  },

  fetchRecentActivity: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardService.getRecentActivity();
      set({
        recentActivity: response.data,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch recent activity',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch recent activity',
      };
    }
  },

  clearError: () => set({ error: null }),
}));
