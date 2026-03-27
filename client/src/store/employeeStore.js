import { create } from 'zustand';
import employeeService from '../services/employee.service';

export const useEmployeeStore = create((set, get) => ({
  employees: [],
  currentEmployee: null,
  total: 0,
  isLoading: false,
  error: null,
  departmentStats: null,
  hierarchy: null,

  fetchEmployees: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await employeeService.getEmployees(params);
      set({
        employees: response.data,
        total: response.total,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch employees',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch employees',
      };
    }
  },

  fetchEmployeeById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await employeeService.getEmployeeById(id);
      set({
        currentEmployee: response.data,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch employee',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch employee',
      };
    }
  },

  createEmployee: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await employeeService.createEmployee(data);
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create employee',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create employee',
      };
    }
  },

  updateEmployee: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await employeeService.updateEmployee(id, data);
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update employee',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update employee',
      };
    }
  },

  deleteEmployee: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await employeeService.deleteEmployee(id);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete employee',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete employee',
      };
    }
  },

  getDepartmentStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await employeeService.getDepartmentStats();
      set({
        departmentStats: response.data,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch department stats',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch department stats',
      };
    }
  },

  getHierarchy: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await employeeService.getHierarchy();
      set({
        hierarchy: response.data,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch hierarchy',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch hierarchy',
      };
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentEmployee: () => set({ currentEmployee: null }),
}));
