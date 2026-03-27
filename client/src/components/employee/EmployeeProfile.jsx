import  { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMail, FiPhone, FiMapPin, FiCalendar, 
  FiBriefcase, FiAward, FiEdit2, FiSave, FiX 
} from 'react-icons/fi';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatDate } from '../../utils/formatters';

const EmployeeProfile = ({ employee, onEdit, readOnly = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(employee);
  
  const handleSave = () => {
    onEdit?.(formData);
    setIsEditing(false);
  };
  
  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'error',
      on_leave: 'warning',
      probation: 'info',
    };
    return colors[status] || 'default';
  };
  
  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="text-secondary-400 mt-1">{icon}</div>
      <div>
        <p className="text-xs text-secondary-500">{label}</p>
        <p className="text-sm text-secondary-900 font-medium">{value || 'Not specified'}</p>
      </div>
    </div>
  );
  
  return (
    <div className="bg-white rounded-xl shadow-soft border border-secondary-200 overflow-hidden">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-xl bg-white p-1 shadow-md">
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {employee?.name?.charAt(0) || 'E'}
              </span>
            </div>
          </div>
        </div>
        
        {!readOnly && (
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <Button
                size="sm"
                variant="ghost"
                icon={<FiEdit2 />}
                onClick={() => setIsEditing(true)}
                className="bg-white/20 text-white hover:bg-white/30"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="success"
                  icon={<FiSave />}
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<FiX />}
                  onClick={() => setIsEditing(false)}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="pt-16 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            {isEditing ? (
              <Input
                value={formData?.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-2xl font-bold"
              />
            ) : (
              <h2 className="text-2xl font-bold text-secondary-900">{employee?.name}</h2>
            )}
            <p className="text-secondary-600 mt-1">{employee?.position}</p>
          </div>
          <Badge variant={getStatusColor(employee?.status)} size="md">
            {employee?.status || 'Active'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900">Contact Information</h3>
            <div className="space-y-3">
              <InfoRow icon={<FiMail />} label="Email" value={employee?.email} />
              <InfoRow icon={<FiPhone />} label="Phone" value={employee?.phone} />
              <InfoRow icon={<FiMapPin />} label="Location" value={employee?.location} />
            </div>
          </div>
          
          {/* Employment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900">Employment Details</h3>
            <div className="space-y-3">
              <InfoRow icon={<FiBriefcase />} label="Department" value={employee?.department} />
              <InfoRow icon={<FiBriefcase />} label="Position" value={employee?.position} />
              <InfoRow icon={<FiCalendar />} label="Join Date" value={formatDate(employee?.joinDate)} />
              <InfoRow icon={<FiAward />} label="Employee ID" value={employee?.employeeId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
