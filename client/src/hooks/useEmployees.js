import { useCallback, useState, useEffect } from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import { useToast } from '../context/ToastContext';
import { useDebounce } from './useDebounce';

export const useEmployees = () => {
  const {
    employees,
    currentEmployee,
    total,
    isLoading,
    fetchEmployees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getDepartmentStats,
    getHierarchy,
  } = useEmployeeStore();
  
  const { success: showSuccess, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  // Load employees when dependencies change
  useEffect(() => {
    loadEmployees();
  }, [currentPage, debouncedSearch, filters]);
  
  const loadEmployees = useCallback(async () => {
    await fetchEmployees({
      page: currentPage,
      search: debouncedSearch,
      ...filters,
    });
  }, [fetchEmployees, currentPage, debouncedSearch, filters]);
  
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);
  
  const handleFilter = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);
  
  const handleCreateEmployee = useCallback(async (data) => {
    const result = await createEmployee(data);
    if (result.success) {
      showSuccess('Employee created successfully');
      await loadEmployees();
      return result.data;
    } else {
      showError(result.error);
      return null;
    }
  }, [createEmployee, loadEmployees, showSuccess, showError]);
  
  const handleUpdateEmployee = useCallback(async (id, data) => {
    const result = await updateEmployee(id, data);
    if (result.success) {
      showSuccess('Employee updated successfully');
      await loadEmployees();
      return result.data;
    } else {
      showError(result.error);
      return null;
    }
  }, [updateEmployee, loadEmployees, showSuccess, showError]);
  
  const handleDeleteEmployee = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const result = await deleteEmployee(id);
      if (result.success) {
        showSuccess('Employee deleted successfully');
        await loadEmployees();
        return true;
      } else {
        showError(result.error);
        return false;
      }
    }
    return false;
  }, [deleteEmployee, loadEmployees, showSuccess, showError]);
  
  const handleViewEmployee = useCallback(async (id) => {
    await fetchEmployeeById(id);
  }, [fetchEmployeeById]);
  
  return {
    employees,
    currentEmployee,
    total,
    isLoading,
    searchTerm,
    currentPage,
    filters,
    setCurrentPage,
    handleSearch,
    handleFilter,
    createEmployee: handleCreateEmployee,
    updateEmployee: handleUpdateEmployee,
    deleteEmployee: handleDeleteEmployee,
    viewEmployee: handleViewEmployee,
    getDepartmentStats,
    getHierarchy,
    refresh: loadEmployees,
  };
};
