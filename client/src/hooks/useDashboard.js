import { useCallback, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { useToast } from '../context/ToastContext';

export const useDashboard = () => {
  const {
    stats,
    performance,
    salaryDistribution,
    recentActivity,
    isLoading,
    fetchDashboardData,
  } = useDashboardStore();
  
  const { error: showError } = useToast();
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = useCallback(async () => {
    try {
      await fetchDashboardData();
    } catch (err) {
      showError('Failed to load dashboard data');
    }
  }, [fetchDashboardData, showError]);
  
  const refresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  
  return {
    stats,
    performance,
    salaryDistribution,
    recentActivity,
    isLoading,
    refresh,
  };
};
