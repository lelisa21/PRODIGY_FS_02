import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';
import employeeService from '../services/employee.service';
import { useAuthStore } from '../store/authStore';
// Initial State
const initialState = {
  employees: [],
  currentEmployee: null,
  total: 0,
  isLoading: false,
  error: null,
  filters: {
    department: '',
    status: '',
    position: '',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 10,
  },
  departmentStats: null,
  hierarchy: null,
};

// Action Types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_EMPLOYEES: 'SET_EMPLOYEES',
  SET_CURRENT_EMPLOYEE: 'SET_CURRENT_EMPLOYEE',
  ADD_EMPLOYEE: 'ADD_EMPLOYEE',
  UPDATE_EMPLOYEE: 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE: 'DELETE_EMPLOYEE',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_DEPARTMENT_STATS: 'SET_DEPARTMENT_STATS',
  SET_HIERARCHY: 'SET_HIERARCHY',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const employeeReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case ACTIONS.SET_EMPLOYEES:
      return {
        ...state,
        employees: action.payload.data,
        total: action.payload.total,
        isLoading: false,
      };
    
    case ACTIONS.SET_CURRENT_EMPLOYEE:
      return { ...state, currentEmployee: action.payload, isLoading: false };
    
    case ACTIONS.ADD_EMPLOYEE:
      return {
        ...state,
        employees: [action.payload, ...state.employees],
        total: state.total + 1,
        isLoading: false,
      };
    
    case ACTIONS.UPDATE_EMPLOYEE:
      return {
        ...state,
        employees: state.employees.map(emp =>
          emp.id === action.payload.id ? action.payload : emp
        ),
        currentEmployee: action.payload,
        isLoading: false,
      };
    
    case ACTIONS.DELETE_EMPLOYEE:
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload),
        total: state.total - 1,
        isLoading: false,
      };
    
    case ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case ACTIONS.SET_PAGINATION:
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    
    case ACTIONS.SET_DEPARTMENT_STATS:
      return { ...state, departmentStats: action.payload };
    
    case ACTIONS.SET_HIERARCHY:
      return { ...state, hierarchy: action.payload };
    
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Create Context
const EmployeeContext = createContext();

// Hook for using Employee Context
export const useEmployeeContext = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployeeContext must be used within EmployeeProvider');
  }
  return context;
};

// Provider Component
export const EmployeeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(employeeReducer, initialState);
  const { success: showSuccess, error: showError } = useToast();
  const { isAuthenticated } = useAuthStore(); 
  const isFirstRender = useRef(true);
  const isLoadingRef = useRef(false);


  const loadEmployees = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const params = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        search: state.filters.search,
        department: state.filters.department,
        status: state.filters.status,
        position: state.filters.position,
      };
      
      const response = await employeeService.getEmployees(params);
      
      dispatch({ type: ACTIONS.SET_EMPLOYEES, payload: response });
      return { success: true, data: response };
    } catch (error) {
      console.error('Load employees error:', error.response?.status);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return { success: false, error: 'Unauthorized' };
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to load employees';
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
      
      if (error.response?.status !== 429) {
        showError(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      isLoadingRef.current = false;
    }
  }, [state.pagination.page, state.pagination.limit, state.filters, isAuthenticated, showError]);

  useEffect(() => {
    if (isAuthenticated) {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        setTimeout(() => loadEmployees(), 100);
      } else {
        loadEmployees();
      }
    } else {
      dispatch({ 
        type: ACTIONS.SET_EMPLOYEES, 
        payload: { data: [], total: 0 } 
      });
    }
  }, [state.pagination.page, state.pagination.limit, state.filters, isAuthenticated, loadEmployees]);

  const loadEmployeeById = useCallback(async (id) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await employeeService.getEmployeeById(id);
      dispatch({ type: ACTIONS.SET_CURRENT_EMPLOYEE, payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load employee';
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [showError]);

  // Create new employee
  const createEmployee = useCallback(async (employeeData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await employeeService.createEmployee(employeeData);
      dispatch({ type: ACTIONS.ADD_EMPLOYEE, payload: response.data });
      showSuccess('Employee created successfully');
      return { success: true, data: response.data, meta: response.meta };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create employee';
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [showSuccess, showError]);

  // Update employee
  const updateEmployee = useCallback(async (id, employeeData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await employeeService.updateEmployee(id, employeeData);
      dispatch({ type: ACTIONS.UPDATE_EMPLOYEE, payload: response.data });
      showSuccess('Employee updated successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update employee';
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [showSuccess, showError]);

  // Delete employee
  const deleteEmployee = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return { success: false };
    }
    
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      await employeeService.deleteEmployee(id);
      dispatch({ type: ACTIONS.DELETE_EMPLOYEE, payload: id });
      showSuccess('Employee deleted successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete employee';
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [showSuccess, showError]);

  // Bulk import employees
  const bulkImport = useCallback(async (employees) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await employeeService.bulkImport(employees);
      await loadEmployees();
      const successCount = response.data?.success?.length || 0;
      const failedCount = response.data?.failed?.length || 0;
      showSuccess(`Import completed: ${successCount} succeeded, ${failedCount} failed`);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to import employees';
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [loadEmployees, showSuccess, showError]);

  // Get department statistics
  const getDepartmentStats = useCallback(async () => {
    try {
      const response = await employeeService.getDepartmentStats();
      dispatch({ type: ACTIONS.SET_DEPARTMENT_STATS, payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch department stats';
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [showError]);

  // Get organization hierarchy
  const getHierarchy = useCallback(async () => {
    try {
      const response = await employeeService.getHierarchy();
      dispatch({ type: ACTIONS.SET_HIERARCHY, payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch hierarchy';
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [showError]);

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({ type: ACTIONS.SET_FILTERS, payload: filters });
    dispatch({ type: ACTIONS.SET_PAGINATION, payload: { page: 1 } });
  }, []);

  // Set pagination
  const setPagination = useCallback((pagination) => {
    dispatch({ type: ACTIONS.SET_PAGINATION, payload: pagination });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    dispatch({
      type: ACTIONS.SET_FILTERS,
      payload: {
        department: '',
        status: '',
        position: '',
        search: '',
      },
    });
    dispatch({ type: ACTIONS.SET_PAGINATION, payload: { page: 1 } });
  }, []);

  const value = {
    employees: state.employees,
    currentEmployee: state.currentEmployee,
    total: state.total,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,
    departmentStats: state.departmentStats,
    hierarchy: state.hierarchy,
    
    // Actions
    loadEmployees,
    loadEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    bulkImport,
    getDepartmentStats,
    getHierarchy,
    setFilters,
    setPagination,
    clearError,
    resetFilters,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};
