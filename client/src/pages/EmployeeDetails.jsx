import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import EmployeeProfile from '../components/employee/EmployeeProfile';
import EmployeeSkills from '../components/employee/EmployeeSkills';
import EmployeeDocuments from '../components/employee/EmployeeDocuments';
import { useEmployeeContext } from '../context/EmployeeContext';
import { useToast } from '../context/ToastContext';
import { FadeIn, SlideIn } from '../components/animations';
import employeeService from '../services/employee.service';
import { useAuthStore } from '../store/authStore';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentEmployee, 
    isLoading, 
    loadEmployeeById, 
    updateEmployee, 
    deleteEmployee 
  } = useEmployeeContext();
  const role = useAuthStore((state) => state.user?.role || 'employee');
  const canEdit = ['admin', 'manager'].includes(role);
  const canDelete = role === 'admin';
  const { success: showSuccess, error: showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (id) {
      loadEmployeeById(id).catch(err => showError('Failed to load employee details'));
    }
  }, [id]);
  
  const handleUpdate = async (data) => {
    const result = await updateEmployee(id, data);
    if (result.success) {
      showSuccess('Employee updated successfully');
      setIsEditing(false);
    } else {
      showError(result.error);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const result = await deleteEmployee(id);
      if (result.success) {
        showSuccess('Employee deleted successfully');
        navigate('/app/employees');
      } else {
        showError(result.error);
      }
    }
  };
  
  const handleSkillsUpdate = async (skills) => {
    await handleUpdate({ skills });
  };
  
  const handleDocumentsUpload = async (files) => {
    try {
      await Promise.all(files.map((file) => employeeService.uploadDocument(id, file)));
      showSuccess('Documents uploaded successfully');
      await loadEmployeeById(id);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload documents');
    }
  };
  
  const handleDocumentDelete = async (docId) => {
    try {
      await employeeService.deleteDocument(id, docId);
      showSuccess('Document deleted successfully');
      await loadEmployeeById(id);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete document');
    }
  };
  
  const tabs = [
    {
      label: 'Profile',
      content: (
        <EmployeeProfile
          employee={currentEmployee}
          onEdit={handleUpdate}
          readOnly={!isEditing}
        />
      ),
    },
    {
      label: 'Skills',
      content: (
        <EmployeeSkills
          skills={currentEmployee?.skills || []}
          onUpdate={handleSkillsUpdate}
          readOnly={!isEditing}
        />
      ),
    },
    {
      label: 'Documents',
      content: (
        <EmployeeDocuments
          documents={currentEmployee?.documents || []}
          onUpload={handleDocumentsUpload}
          onDelete={handleDocumentDelete}
          readOnly={!isEditing}
        />
      ),
    },
  ];
  
  if (isLoading && !currentEmployee) {
    return (
      <div className="p-8">
        <div className="skeleton h-96 rounded-lg" />
      </div>
    );
  }
  
  if (!currentEmployee) {
    return (
      <div className="p-8 text-center">
        <p className="text-secondary-500">Employee not found</p>
        <Button onClick={() => navigate('/app/employees')} className="mt-4">
          Back to Employees
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            icon={<FiArrowLeft />}
            onClick={() => navigate('/app/employees')}
          >
            Back
          </Button>
          
          <div className="flex gap-3">
            {canEdit && (
              !isEditing ? (
                <Button
                  variant="outline"
                  icon={<FiEdit2 />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    icon={<FiX />}
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    icon={<FiSave />}
                    onClick={() => {
                      // Trigger save from profile component
                      window.dispatchEvent(new Event('saveEmployee'));
                    }}
                  >
                    Save Changes
                  </Button>
                </>
              )
            )}
            {canDelete && (
              <Button
                variant="danger"
                icon={<FiTrash2 />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </FadeIn>
      
      <SlideIn direction="up">
        <Tabs tabs={tabs} />
      </SlideIn>
    </div>
  );
};

export default EmployeeDetails;
