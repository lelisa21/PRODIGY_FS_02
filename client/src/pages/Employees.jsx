import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiUpload, FiX } from 'react-icons/fi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import EmployeeTable from '../components/employee/EmployeeTable';
import EmployeeForm from '../components/employee/EmployeeForm';
import { useEmployeeContext } from '../context/EmployeeContext';
import { useToast } from '../context/ToastContext';
import { FadeIn, SlideIn } from '../components/animations';
import { exportToCSV, importFromCSV, importFromExcel } from '../utils/exportHelpers';
import { useAuthStore } from '../store/authStore';

const Employees = () => {
  const navigate = useNavigate();
  const {
    employees,
    total,
    isLoading,
    filters,
    pagination,
    deleteEmployee,
    bulkImport,
    setFilters,
    setPagination,
    loadEmployees,
    resetFilters,
  } = useEmployeeContext();

  const role = useAuthStore((state) => state.user?.role || 'employee');
  const canCreate = role === 'admin';
  const canImport = role === 'admin';
  const canDelete = role === 'admin';
  
  const { success: showSuccess, error: showError } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const [localFilters, setLocalFilters] = useState({
    department: '',
    status: '',
    position: '',
    search: '',
  });
  
  useEffect(() => {
    setLocalFilters({
      department: filters.department || '',
      status: filters.status || '',
      position: filters.position || '',
      search: filters.search || '',
    });
  }, [filters]);
  
  const handleSearch = useCallback((value) => {
    setFilters({ ...localFilters, search: value });
  }, [setFilters, localFilters]);
  
  const handleApplyFilters = useCallback(() => {
    setFilters(localFilters);
    setShowFilters(false);
  }, [setFilters, localFilters]);
  
  const handleClearFilters = useCallback(() => {
    setLocalFilters({
      department: '',
      status: '',
      position: '',
      search: '',
    });
    resetFilters();
    setShowFilters(false);
  }, [resetFilters]);
  
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id) => {
    const result = await deleteEmployee(id);
    if (result.success) {
      showSuccess('Employee deleted successfully');
      loadEmployees();
    } else {
      showError(result.error);
    }
  };
  
  const handleView = (employee) => {
    navigate(`/app/employees/${employee.id}`);
  };
  
  const handleExport = () => {
    exportToCSV(employees, 'employees.csv');
    showSuccess('Export started');
  };

  const normalizeImportRow = (row) => {
    const normalized = { ...row };
    if (normalized.name && (!normalized.firstName || !normalized.lastName)) {
      const [firstName, ...lastName] = String(normalized.name).trim().split(' ');
      normalized.firstName = normalized.firstName || firstName;
      normalized.lastName = normalized.lastName || lastName.join(' ');
    }
    if (!normalized.email && normalized.workEmail) {
      normalized.email = normalized.workEmail;
    }
    if (normalized.salary !== undefined) {
      const parsed = Number(normalized.salary);
      normalized.salary = Number.isNaN(parsed) ? 0 : parsed;
    }
    return normalized;
  };

  const handleImport = async (file) => {
    setIsImporting(true);
    try {
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      const data = isCsv ? await importFromCSV(file) : await importFromExcel(file);
      const cleaned = data
        .map(normalizeImportRow)
        .filter((row) => row && (row.email || row.workEmail));
      if (cleaned.length === 0) {
        showError('No valid rows found in the file.');
        return;
      }
      const result = await bulkImport(cleaned);
      if (result.success) {
        showSuccess('Import completed successfully');
        loadEmployees();
      }
    } catch (error) {
      showError('Import failed. Please check your file format.');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };
  
  const handleModalSuccess = () => {
    handleModalClose();
    loadEmployees();
  };
  
  const handlePageChange = (page) => {
    setPagination({ page });
  };
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 ">
      <FadeIn>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Employees</h1>
            <p className="text-secondary-600 mt-1">Manage your workforce efficiently</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<FiDownload />}
              onClick={handleExport}
            >
              Export
            </Button>
            {canCreate && (
              <Button
                variant="primary"
                icon={<FiPlus />}
                onClick={() => setIsModalOpen(true)}
              >
                Add Employee
              </Button>
            )}
          </div>
        </div>
      </FadeIn>
      
      <SlideIn direction="up">
        <div className="bg-white rounded-xl shadow-soft border border-secondary-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search employees by name, email, or department..."
                icon={<FiSearch />}
                value={localFilters.search}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                fullWidth
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                icon={<FiFilter />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filter
              </Button>
              <Button
                variant="outline"
                icon={<FiUpload />}
                onClick={() => fileInputRef.current?.click()}
                isLoading={isImporting}
                disabled={!canImport}
              >
                Import
              </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && canImport) {
                  handleImport(file);
                }
                e.target.value = '';
              }}
            />
            </div>
          </div>
          
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-secondary-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  placeholder="Department"
                  value={localFilters.department}
                  onChange={(e) => setLocalFilters({ ...localFilters, department: e.target.value })}
                />
                <select
                  value={localFilters.status}
                  onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="probation">Probation</option>
                </select>
                <Input
                  placeholder="Position"
                  value={localFilters.position}
                  onChange={(e) => setLocalFilters({ ...localFilters, position: e.target.value })}
                />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear All
                </Button>
                <Button variant="primary" size="sm" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </SlideIn>
      
      <FadeIn delay={0.2}>
        <div className="bg-white rounded-xl shadow-soft border border-secondary-100 overflow-hidden">
          <EmployeeTable
            employees={employees}
            loading={isLoading}
            pagination
            pageSize={pagination.limit}
            totalItems={total}
            currentPage={pagination.page}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={canDelete ? handleDelete : undefined}
            onView={handleView}
          />
        </div>
      </FadeIn>
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
        size="lg"
      >
        <EmployeeForm
          employee={selectedEmployee}
          onSuccess={handleModalSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default Employees;
