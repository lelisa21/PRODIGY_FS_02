import api from './api';

class EmployeeService {
  async getEmployees(params = {}) {
    const response = await api.get('/employees', { params });
    return response.data;
  }

  async getEmployeeById(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  }

  async createEmployee(data) {
    const response = await api.post('/employees', data);
    return response.data;
  }

  async updateEmployee(id, data) {
    const response = await api.patch(`/employees/${id}`, data);
    return response.data;
  }

  async deleteEmployee(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }

  async getDepartmentStats() {
    const response = await api.get('/employees/stats/department');
    return response.data;
  }

  async getHierarchy() {
    const response = await api.get('/employees/hierarchy');
    return response.data;
  }

  async bulkImport(data) {
    const response = await api.post('/employees/bulk/import', data);
    return response.data;
  }

  async getEmployeeSkills(id) {
    const response = await api.get(`/employees/${id}/skills`);
    return response.data;
  }

  async updateEmployeeSkills(id, skills) {
    const response = await api.patch(`/employees/${id}/skills`, { skills });
    return response.data;
  }

  async getEmployeeDocuments(id) {
    const response = await api.get(`/employees/${id}/documents`);
    return response.data;
  }

  async uploadDocument(id, file) {
    const formData = new FormData();
    formData.append('document', file);
    const response = await api.post(`/employees/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteDocument(employeeId, documentId) {
    const response = await api.delete(`/employees/${employeeId}/documents/${documentId}`);
    return response.data;
  }
}

export default new EmployeeService();
