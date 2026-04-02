import  { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiBriefcase, 
  FiMapPin, FiCalendar, FiSave, FiX 
} from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import { useEmployeeStore } from '../../store/employeeStore';
import { useToast } from '../../context/ToastContext';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  joinDate: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
  salary: z.preprocess(
    (val) => (val === '' || val === null || Number.isNaN(val) ? undefined : val),
    z.number().min(0).optional()
  ),
  status: z.enum(['active', 'inactive', 'on_leave', 'probation']).default('active'),
});

const EmployeeForm = ({ employee, onSuccess, onCancel }) => {
  const { createEmployee, updateEmployee, isLoading } = useEmployeeStore();
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      location: '',
      joinDate: '',
      salary: '',
      status: 'active',
    },
  });
  
  useEffect(() => {
    if (employee) {
      reset({
        ...employee,
        joinDate: employee.joinDate ? String(employee.joinDate).split('T')[0] : '',
      });
    }
  }, [employee, reset]);
  
  const onSubmit = async (data) => {
    try {
      let result;
      if (employee) {
        result = await updateEmployee(employee.id, data);
        if (result.success) {
          showSuccess('Employee updated successfully');
          onSuccess();
        }
      } else {
        result = await createEmployee(data);
        if (result.success) {
          showSuccess('Employee created successfully');
          if (result.meta?.tempPassword) {
            showInfo(`Temporary password: ${result.meta.tempPassword}`);
          }
          onSuccess();
        }
      }
      if (!result.success) {
        showError(result.error);
      }
    } catch (error) {
      showError('An error occurred');
    }
  };
  
  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'employment', label: 'Employment Details' },
    { id: 'contact', label: 'Contact Information' },
  ];
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Form Fields */}
      <div className="space-y-4">
        {activeTab === 'basic' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Input
              label="Full Name"
              placeholder="John Doe"
              icon={<FiUser />}
              error={errors.name?.message}
              required
              {...register('name')}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="john@company.com"
                icon={<FiMail />}
                error={errors.email?.message}
                required
                {...register('email')}
              />
              
              <Input
                label="Phone Number"
                placeholder="+1 234 567 8900"
                icon={<FiPhone />}
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Department"
                placeholder="Engineering"
                icon={<FiBriefcase />}
                error={errors.department?.message}
                required
                {...register('department')}
              />
              
              <Input
                label="Position"
                placeholder="Software Engineer"
                icon={<FiBriefcase />}
                error={errors.position?.message}
                required
                {...register('position')}
              />
            </div>
          </motion.div>
        )}
        
        {activeTab === 'employment' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Join Date"
                type="date"
                icon={<FiCalendar />}
                error={errors.joinDate?.message}
                {...register('joinDate')}
              />
              
              <Input
                label="Salary"
                type="number"
                placeholder="50000"
                icon={<FiBriefcase />}
                error={errors.salary?.message}
                {...register('salary', { valueAsNumber: true })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Status
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('status')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="probation">Probation</option>
              </select>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Input
              label="Location"
              placeholder="New York, NY"
              icon={<FiMapPin />}
              error={errors.location?.message}
              {...register('location')}
            />
          </motion.div>
        )}
      </div>
      
      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-secondary-200">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          icon={<FiSave />}
        >
          {employee ? 'Update Employee' : 'Create Employee'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          icon={<FiX />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
