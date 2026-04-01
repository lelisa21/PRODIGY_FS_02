import api from './api';

// Helper to transform backend employee to frontend format
const transformEmployee = (employee) => {
  if (!employee) return null;
  
  return {
    id: employee._id,
    name: employee.user?.profile 
      ? `${employee.user.profile.firstName || ''} ${employee.user.profile.lastName || ''}`.trim()
      : 'Unknown',
    
    // User info
    user: employee.user,
    
    employeeId: employee.employmentDetails?.employeeId || '',
    department: employee.employmentDetails?.department || '',
    position: employee.employmentDetails?.position || '',
    email: employee.employmentDetails?.workEmail || '',
    workPhone: employee.employmentDetails?.workPhone || '',
    hireDate: employee.employmentDetails?.hireDate,
    joinDate: employee.employmentDetails?.hireDate,
    employmentType: employee.employmentDetails?.employmentType || 'full-time',
    workLocation: employee.employmentDetails?.workLocation || '',
    manager: employee.employmentDetails?.manager,
    
    // Compensation
    salary: employee.compensation?.salary || 0,
    payFrequency: employee.compensation?.payFrequency || 'monthly',
    bankDetails: employee.compensation?.bankDetails,
    
    // Personal info
    dateOfBirth: employee.personalInfo?.dateOfBirth,
    gender: employee.personalInfo?.gender,
    maritalStatus: employee.personalInfo?.maritalStatus,
    nationality: employee.personalInfo?.nationality,
    address: employee.personalInfo?.address,
    emergencyContact: employee.personalInfo?.emergencyContact,
    
    // Derived fields
    phone: employee.employmentDetails?.workPhone || employee.personalInfo?.emergencyContact?.phone || '',
    location: employee.employmentDetails?.workLocation || employee.personalInfo?.address?.city || '',
    
    // Arrays
    skills: employee.skills || [],
    documents: (employee.documents || []).map(doc => ({
      ...doc,
      id: doc._id || doc.id,
    })),
    jobHistory: employee.jobHistory || [],
    education: employee.education || [],
    
    // Performance & Attendance
    status: employee.status || 'active',
    performance: employee.performance || {},
    attendance: employee.attendance || {},
    
    // Virtuals
    yearsOfService: employee.yearsOfService,
    availableLeaves: employee.availableLeaves,
    
    // Raw data for debugging (optional)
    raw: employee
  };
};

// Helper to transform frontend data to backend format
const transformToBackend = (data) => {
  const backendData = {};
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (name) {
    const [firstName, ...lastNameParts] = name.split(' ').filter(Boolean);
    backendData.userProfile = {
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || ''
    };
  }
  if (data.email !== undefined) {
    backendData.userEmail = data.email;
  }
  
  // Employment Details
  const joinDate = data.hireDate || data.joinDate;
  const workLocation = data.workLocation !== undefined ? data.workLocation : data.location;
  const workPhone = data.workPhone !== undefined ? data.workPhone : data.phone;
  if (data.department || data.position || data.email || joinDate || workLocation || workPhone) {
    backendData.employmentDetails = {};
    if (data.department !== undefined) backendData.employmentDetails.department = data.department;
    if (data.position !== undefined) backendData.employmentDetails.position = data.position;
    if (data.email !== undefined) backendData.employmentDetails.workEmail = data.email;
    if (workPhone !== undefined) backendData.employmentDetails.workPhone = workPhone;
    if (joinDate !== undefined) backendData.employmentDetails.hireDate = joinDate;
    if (data.employmentType !== undefined) backendData.employmentDetails.employmentType = data.employmentType;
    if (workLocation !== undefined) backendData.employmentDetails.workLocation = workLocation;
    if (data.manager !== undefined) backendData.employmentDetails.manager = data.manager;
  }
  
  // Compensation
  if (data.salary !== undefined || data.payFrequency !== undefined) {
    backendData.compensation = {};
    if (data.salary !== undefined) backendData.compensation.salary = data.salary;
    if (data.payFrequency !== undefined) backendData.compensation.payFrequency = data.payFrequency;
    if (data.bankDetails !== undefined) backendData.compensation.bankDetails = data.bankDetails;
  }
  
  // Personal Info
  if (data.dateOfBirth || data.gender || data.maritalStatus || data.nationality || data.address || data.emergencyContact) {
    backendData.personalInfo = {};
    if (data.dateOfBirth !== undefined) backendData.personalInfo.dateOfBirth = data.dateOfBirth;
    if (data.gender !== undefined) backendData.personalInfo.gender = data.gender;
    if (data.maritalStatus !== undefined) backendData.personalInfo.maritalStatus = data.maritalStatus;
    if (data.nationality !== undefined) backendData.personalInfo.nationality = data.nationality;
    if (data.address !== undefined) backendData.personalInfo.address = data.address;
    if (data.emergencyContact !== undefined) backendData.personalInfo.emergencyContact = data.emergencyContact;
  }
  
  // Arrays
  if (data.skills !== undefined) backendData.skills = data.skills;
  if (data.documents !== undefined) backendData.documents = data.documents;
  if (data.jobHistory !== undefined) backendData.jobHistory = data.jobHistory;
  if (data.education !== undefined) backendData.education = data.education;
  
  // Status
  if (data.status !== undefined) backendData.status = data.status;
  
  // Performance
  if (data.performance !== undefined) backendData.performance = data.performance;
  
  // Attendance
  if (data.attendance !== undefined) backendData.attendance = data.attendance;
  
  return backendData;
};

const employeeService = {
  // Get all employees with pagination
  getEmployees: async (params) => {
    try {
      const response = await api.get('/employees', { params });
      console.log('Raw employees response:', response.data); // Debug
      
      // Handle different response structures
      let employeesData = [];
      let pagination = {};
      
      if (response.data?.data) {
        employeesData = response.data.data;
        pagination = response.data.pagination || {};
      } else if (Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (response.data?.employees) {
        employeesData = response.data.employees;
        pagination = response.data.pagination;
      }
      
      // Transform each employee
      const transformedEmployees = employeesData.map(transformEmployee);
      console.log('Transformed employees:', transformedEmployees); // Debug
      
      return {
        data: transformedEmployees,
        total: pagination.total || transformedEmployees.length,
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          total: pagination.total || transformedEmployees.length,
          pages: pagination.pages || 1
        }
      };
    } catch (error) {
      console.error('Get employees error:', error);
      throw error;
    }
  },
  
  // Get single employee by ID
  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`/employees/${id}`);
      console.log('Raw employee response:', response.data); // Debug
      
      let employeeData = response.data?.data || response.data;
      const transformedEmployee = transformEmployee(employeeData);
      console.log('Transformed employee:', transformedEmployee); // Debug
      
      return {
        success: true,
        data: transformedEmployee
      };
    } catch (error) {
      console.error('Get employee by ID error:', error);
      throw error;
    }
  },
  
  // Create new employee
  createEmployee: async (data) => {
    try {
      // Transform frontend data to backend format
      const backendData = transformToBackend(data);
      
      // Add user reference if creating with existing user
      if (data.userId) {
        backendData.user = data.userId;
      }
      
      console.log('Sending to backend:', backendData); // Debug
      
      const response = await api.post('/employees', backendData);
      
      // Transform response back to frontend format
      let employeeData = response.data?.data || response.data;
      const transformedEmployee = transformEmployee(employeeData);
      
      return {
        success: true,
        data: transformedEmployee,
        meta: response.data?.meta
      };
    } catch (error) {
      console.error('Create employee error:', error);
      throw error;
    }
  },
  
  // Update employee
  updateEmployee: async (id, data) => {
    try {
      // Transform frontend data to backend format
      const backendData = transformToBackend(data);
      
      console.log('Updating with:', backendData); // Debug
      
      const response = await api.patch(`/employees/${id}`, backendData);
      
      // Transform response back to frontend format
      let employeeData = response.data?.data || response.data;
      const transformedEmployee = transformEmployee(employeeData);
      
      return {
        success: true,
        data: transformedEmployee
      };
    } catch (error) {
      console.error('Update employee error:', error);
      throw error;
    }
  },
  
  // Delete employee
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Delete employee error:', error);
      throw error;
    }
  },
  
  // Department statistics
  getDepartmentStats: async () => {
    try {
      const response = await api.get('/employees/stats/department');
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      console.error('Get department stats error:', error);
      throw error;
    }
  },
  
  // Organization hierarchy
  getHierarchy: async () => {
    try {
      const response = await api.get('/employees/hierarchy');
      const hierarchyData = response.data?.data || response.data;
      const normalized = Array.isArray(hierarchyData)
        ? { name: 'Organization', position: 'Hierarchy', children: hierarchyData }
        : hierarchyData;
      return {
        success: true,
        data: normalized
      };
    } catch (error) {
      console.error('Get hierarchy error:', error);
      throw error;
    }
  },
  
  // Bulk import
  bulkImport: async (employees) => {
    try {
      const response = await api.post('/employees/bulk/import', { employees });
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      console.error('Bulk import error:', error);
      throw error;
    }
  },
  
  // Skills management
  getEmployeeSkills: async (id) => {
    try {
      const response = await api.get(`/employees/${id}/skills`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      console.error('Get skills error:', error);
      throw error;
    }
  },
  
  addEmployeeSkill: async (id, skill) => {
    try {
      const response = await api.post(`/employees/${id}/skills`, { skill });
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      console.error('Add skill error:', error);
      throw error;
    }
  },
  
  updateEmployeeSkills: async (id, skills) => {
    try {
      const response = await api.patch(`/employees/${id}/skills`, { skills });
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      console.error('Update skills error:', error);
      throw error;
    }
  },
  
  // Documents management
  getEmployeeDocuments: async (id) => {
    try {
      const response = await api.get(`/employees/${id}/documents`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  },
  
  uploadDocument: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await api.post(`/employees/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  },
  
  deleteDocument: async (id, documentId) => {
    try {
      const response = await api.delete(`/employees/${id}/documents/${documentId}`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }
};

export default employeeService;
