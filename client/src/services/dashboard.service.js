import api from './api';

class DashboardService {
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }

  async getPerformance() {
    const response = await api.get('/dashboard/performance');
    return response.data;
  }

  async getSalaryDistribution() {
    const response = await api.get('/dashboard/salary-distribution');
    return response.data;
  }

  async getRecentActivity() {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  }

  async getAttendanceStats() {
    const response = await api.get('/dashboard/attendance');
    return response.data;
  }

  async getDepartmentMetrics() {
    const response = await api.get('/dashboard/department-metrics');
    return response.data;
  }
}

export default new DashboardService();
