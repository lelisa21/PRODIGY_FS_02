import { useState, useEffect } from 'react';
import { FiDownload, FiCalendar, FiPieChart, FiBarChart2, FiRefreshCw, FiUsers, FiTrendingUp, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Chart from '../components/dashboard/Chart';
import { FadeIn, StaggerChildren } from '../components/animations';
import { useAuthStore } from '../store';
import employeeService from '../services/employee.service';
import dashboardService from '../services/dashboard.service';
import api from '../services/api';

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('performance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionWarnings, setPermissionWarnings] = useState([]);
  
  const [performanceData, setPerformanceData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [stats, setStats] = useState({
    avgPerformance: 0,
    attendanceRate: 0,
    totalEmployees: 0,
    newHires: 0,
    performanceTrend: 0,
    attendanceTrend: 0,
    avgSalary: 0,
    departments: 0
  });
  
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  
  // Helper function to safely get numeric value
  const safeNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setPermissionWarnings([]);
    
    const warnings = [];
    
    try {
      // 1. Fetch employees data
      let employees = [];
      try {
        const employeesResponse = await employeeService.getEmployees({ limit: 1000 });
        employees = employeesResponse?.data || [];
      } catch (err) {
        console.warn('Could not fetch employees:', err);
        warnings.push({ type: 'employees', message: 'Employee data could not be loaded' });
      }
      
      // 2. Fetch dashboard stats
      let dashboardStats = {};
      try {
        const statsResponse = await dashboardService.getStats();
        dashboardStats = statsResponse?.data || {};
      } catch (err) {
        console.warn('Could not fetch stats:', err);
      }
      
      // 3. Fetch performance data
      let performanceHistory = {};
      try {
        const performanceResponse = await dashboardService.getPerformance();
        performanceHistory = performanceResponse?.data || {};
      } catch (err) {
        console.warn('Could not fetch performance:', err);
        if (err.response?.status === 403) {
          warnings.push({ type: 'performance', message: 'Performance data requires manager or admin role' });
        }
      }
      
      // 4. Fetch attendance stats
      let attendanceHistory = {};
      try {
        const attendanceResponse = await dashboardService.getAttendanceStats();
        attendanceHistory = attendanceResponse?.data || {};
      } catch (err) {
        console.warn('Could not fetch attendance:', err);
      }
      
      // 5. Fetch salary distribution (admin only)
      let salaryDistribution = {};
      if (isAdmin) {
        try {
          const salaryResponse = await dashboardService.getSalaryDistribution();
          salaryDistribution = salaryResponse?.data || {};
        } catch (err) {
          console.warn('Could not fetch salary distribution:', err);
          if (err.response?.status === 403) {
            warnings.push({ type: 'salary', message: 'Salary data requires admin role' });
          }
        }
      }
      
      // 6. Fetch department metrics
      let departmentMetrics = {};
      try {
        const deptResponse = await dashboardService.getDepartmentMetrics();
        departmentMetrics = deptResponse?.data || {};
      } catch (err) {
        console.warn('Could not fetch department metrics:', err);
      }
      
      setPermissionWarnings(warnings);
      
      // Calculate stats with safe defaults
      const totalEmployees = employees.length;
      
      // Safe average performance calculation
      let avgPerformance = 0;
      if (employees.length > 0) {
        const totalPerformance = employees.reduce((sum, emp) => {
          const rating = safeNumber(emp?.performance?.rating, safeNumber(emp?.performance, 0));
          return sum + rating;
        }, 0);
        avgPerformance = totalPerformance / employees.length;
      }
      
      // Safe attendance rate calculation
      let attendanceRate = 0;
      if (employees.length > 0) {
        const totalAttendance = employees.reduce((sum, emp) => {
          const rate = safeNumber(emp?.attendance?.rate, safeNumber(emp?.attendance, 85));
          return sum + rate;
        }, 0);
        attendanceRate = totalAttendance / employees.length;
      }
      
      // Safe salary calculation
      let avgSalary = 0;
      if (employees.length > 0 && isAdmin) {
        const totalSalary = employees.reduce((sum, emp) => {
          const salary = safeNumber(emp?.salary, safeNumber(emp?.compensation?.salary, 0));
          return sum + salary;
        }, 0);
        avgSalary = totalSalary / employees.length;
      }
      
      // Count new hires (employees hired in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newHires = employees.filter(emp => {
        const hireDate = emp?.hireDate || emp?.joinDate || emp?.employeeDetails?.joinDate;
        return hireDate && new Date(hireDate) > thirtyDaysAgo;
      }).length;
      
      // Get unique departments
      const uniqueDepts = new Set(employees.map(emp => emp?.department || emp?.employeeDetails?.department).filter(Boolean));
      
      // Process data for charts
      const performanceChartData = processPerformanceData(performanceHistory, dateRange, employees);
      const attendanceChartData = processAttendanceData(attendanceHistory, dateRange, employees);
      const salaryChartData = processSalaryData(salaryDistribution, employees, isAdmin);
      const deptChartData = processDepartmentData(departmentMetrics, employees);
      
      setPerformanceData(performanceChartData);
      setAttendanceData(attendanceChartData);
      setSalaryData(salaryChartData);
      setDepartmentData(deptChartData);
      
      setStats({
        avgPerformance: Math.round(avgPerformance),
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        totalEmployees,
        newHires,
        avgSalary: Math.round(avgSalary),
        departments: uniqueDepts.size,
        performanceTrend: safeNumber(dashboardStats?.performanceTrend, 0),
        attendanceTrend: safeNumber(dashboardStats?.attendanceTrend, 0)
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  const processPerformanceData = (data, range, employees) => {
    // Try to use API data first
    if (data && data.history && data.history.length > 0) {
      return data.history.map(item => ({
        month: item.month || item.period || 'Unknown',
        performance: safeNumber(item.performance, safeNumber(item.value, 0)),
        target: safeNumber(item.target, 80)
      }));
    }
    
    // Fallback: Calculate from employee data
    if (employees && employees.length > 0) {
      const months = getMonthsForRange(range);
      const avgPerf = employees.reduce((sum, emp) => {
        return sum + safeNumber(emp?.performance?.rating, safeNumber(emp?.performance, 0));
      }, 0) / employees.length;
      
      return months.map((month) => ({
        month,
        performance: Math.min(100, Math.max(0, avgPerf + (Math.random() * 10 - 5))),
        target: 80
      }));
    }
    
    return generatePerformanceData(range);
  };
  
  const processAttendanceData = (data, range, employees) => {
    if (data && data.history && data.history.length > 0) {
      return data.history.map(item => ({
        month: item.month || item.period || 'Unknown',
        present: safeNumber(item.present, safeNumber(item.rate, 90)),
        absent: safeNumber(item.absent, 100 - safeNumber(item.present, 90))
      }));
    }
    
    if (employees && employees.length > 0) {
      const months = getMonthsForRange(range);
      const avgAttendance = employees.reduce((sum, emp) => {
        return sum + safeNumber(emp?.attendance?.rate, safeNumber(emp?.attendance, 85));
      }, 0) / employees.length;
      
      return months.map((month) => ({
        month,
        present: Math.min(100, Math.max(0, avgAttendance + (Math.random() * 5 - 2.5))),
        absent: 100 - avgAttendance
      }));
    }
    
    return generateAttendanceData(range);
  };
  
  const processSalaryData = (data, employees, isAdmin) => {
    if (!isAdmin) return [];
    
    if (data && data.distribution && data.distribution.length > 0) {
      return data.distribution;
    }
    
    // Group employees by salary range
    const ranges = {
      '0-30k': 0,
      '30k-50k': 0,
      '50k-80k': 0,
      '80k-120k': 0,
      '120k+': 0
    };
    
    employees.forEach(emp => {
      const salary = safeNumber(emp?.salary, safeNumber(emp?.compensation?.salary, 0));
      if (salary < 30000) ranges['0-30k']++;
      else if (salary < 50000) ranges['30k-50k']++;
      else if (salary < 80000) ranges['50k-80k']++;
      else if (salary < 120000) ranges['80k-120k']++;
      else if (salary >= 120000) ranges['120k+']++;
    });
    
    return Object.entries(ranges).map(([range, count]) => ({
      range,
      count,
      percentage: employees.length > 0 ? Number(((count / employees.length) * 100).toFixed(2)) : 0
    }));
  };
  
  const processDepartmentData = (data, employees) => {
    if (data && data.metrics && data.metrics.length > 0) {
      return data.metrics;
    }
    
    // Group by department
    const deptMap = new Map();
    employees.forEach(emp => {
      const dept = emp?.department || emp?.employeeDetails?.department || 'Unassigned';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { count: 0, totalPerf: 0 });
      }
      const deptData = deptMap.get(dept);
      deptData.count++;
      deptData.totalPerf += safeNumber(emp?.performance?.rating, safeNumber(emp?.performance, 0));
    });
    
    return Array.from(deptMap.entries()).map(([name, data]) => ({
      department: name,
      employees: data.count,
      avgPerformance: data.count > 0 ? Math.round(data.totalPerf / data.count) : 0
    }));
  };
  
  const generatePerformanceData = (range) => {
    const months = getMonthsForRange(range);
    return months.map((month, index) => ({
      month,
      performance: 75 + (index * 3) + Math.floor(Math.random() * 5),
      target: 80 + (index * 2)
    }));
  };
  
  const generateAttendanceData = (range) => {
    const months = getMonthsForRange(range);
    return months.map((month, index) => ({
      month,
      present: 90 + (index * 1) + Math.floor(Math.random() * 3),
      absent: 10 - (index * 0.5) - Math.floor(Math.random() * 2)
    }));
  };
  
  const getMonthsForRange = (range) => {
    switch(range) {
      case 'week': return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month': return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'quarter': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      default: return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
  };
  
  const handleExport = async () => {
    try {
      if (reportType === 'salary' && !isAdmin) {
        setError('Salary reports are only available for administrators');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      const response = await api.get(`/reports/export`, {
        params: { type: reportType, range: dateRange },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
    } catch (err) {
      console.error('Export error:', err);
      if (err.response?.status === 403) {
        setError('You don\'t have permission to export this report');
      } else {
        setError('Failed to export report');
      }
      setTimeout(() => setError(null), 3000);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [dateRange]);
  
  const reportTypes = [
    { id: 'performance', label: 'Performance Report', icon: <FiBarChart2 />, roles: ['admin', 'manager', 'employee'] },
    { id: 'attendance', label: 'Attendance Report', icon: <FiCalendar />, roles: ['admin', 'manager', 'employee'] },
    { id: 'salary', label: 'Salary Report', icon: <FiPieChart />, roles: ['admin'] },
    { id: 'department', label: 'Department Report', icon: <FiUsers />, roles: ['admin', 'manager'] },
  ];
  
  const accessibleReportTypes = reportTypes.filter(type => 
    type.roles.includes(user?.role) || 
    (user?.role === 'employee' && (type.id === 'performance' || type.id === 'attendance'))
  );
  
  const dateRanges = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last 12 Months' },
  ];
  
  const getChartData = () => {
    switch(reportType) {
      case 'performance': return performanceData;
      case 'attendance': return attendanceData;
      case 'salary': return salaryData;
      case 'department': return departmentData;
      default: return performanceData;
    }
  };
  
  const getChartDataKey = () => {
    switch(reportType) {
      case 'performance': return ['performance', 'target'];
      case 'attendance': return ['present', 'absent'];
      case 'salary': return ['count', 'percentage'];
      case 'department': return ['employees', 'avgPerformance'];
      default: return ['performance', 'target'];
    }
  };
  
  const getChartType = () => {
    switch(reportType) {
      case 'salary': return 'bar';
      case 'department': return 'bar';
      default: return 'line';
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading reports...</p>
        </div>
      </div>
    );
  }
  
  if (error && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <p className="text-secondary-600 mb-4">{error}</p>
          <Button variant="primary" onClick={fetchData}>
            <FiRefreshCw className="mr-2" /> Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FadeIn>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Reports & Analytics</h1>
            <p className="text-secondary-600 mt-1">Generate and analyze organizational reports</p>
            {!isAdmin && (
              <p className="text-xs text-secondary-500 mt-1 flex items-center gap-1">
                <FiAlertCircle size={12} />
                Some reports are restricted to administrators
              </p>
            )}
          </div>
          <Button 
            variant="primary" 
            icon={<FiDownload />} 
            onClick={handleExport}
            disabled={reportType === 'salary' && !isAdmin}
          >
            Export Report
          </Button>
        </div>
      </FadeIn>
      
      {/* Permission Warnings */}
      {permissionWarnings.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <FiAlertCircle className="text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Limited Data Available</p>
              <ul className="text-xs text-yellow-700 mt-1">
                {permissionWarnings.map((warning, idx) => (
                  <li key={idx}>• {warning.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Report Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4">
          <label className="block text-sm font-medium text-secondary-700 mb-2">Report Type</label>
          <div className="flex flex-wrap gap-2">
            {accessibleReportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  reportType === type.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                } ${type.id === 'salary' && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={type.id === 'salary' && !isAdmin}
              >
                {type.icon}
                <span className="text-sm whitespace-nowrap">{type.label}</span>
                {type.id === 'salary' && !isAdmin && (
                  <span className="text-xs ml-1">(Admin only)</span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4">
          <label className="block text-sm font-medium text-secondary-700 mb-2">Date Range</label>
          <div className="flex flex-wrap gap-2">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                  dateRange === range.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                <span className="text-sm whitespace-nowrap">{range.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <StaggerChildren staggerDelay={0.1}>
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500 mb-1">Total Employees</p>
                  <p className="text-2xl font-bold text-secondary-900">{stats.totalEmployees || 0}</p>
                  <p className="text-xs text-success-600 mt-1">+{stats.newHires || 0} new hires</p>
                </div>
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUsers className="text-primary-500" size={20} />
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500 mb-1">Avg Performance</p>
                  <p className="text-2xl font-bold text-secondary-900">{Math.round(stats.avgPerformance || 0)}%</p>
                  <p className={`text-xs mt-1 ${(stats.performanceTrend || 0) >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                    {(stats.performanceTrend || 0) >= 0 ? '↑' : '↓'} {Math.abs(stats.performanceTrend || 0)}% from last month
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FiTrendingUp className="text-green-500" size={20} />
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500 mb-1">Attendance Rate</p>
                  <p className="text-2xl font-bold text-secondary-900">{Math.round(stats.attendanceRate || 0)}%</p>
                  <p className={`text-xs mt-1 ${(stats.attendanceTrend || 0) >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                    {(stats.attendanceTrend || 0) >= 0 ? '↑' : '↓'} {Math.abs(stats.attendanceTrend || 0)}% from last month
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="text-blue-500" size={20} />
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500 mb-1">Avg Salary</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {isAdmin ? `$${Math.round((stats.avgSalary || 0) / 1000)}k` : '***'}
                  </p>
                  <p className="text-xs text-secondary-500 mt-1">{stats.departments || 0} departments</p>
                  {!isAdmin && (
                    <p className="text-xs text-secondary-400 mt-0.5">Restricted to admin</p>
                  )}
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FiPieChart className="text-purple-500" size={20} />
                </div>
              </div>
            </Card>
          </div>
          
          {/* Main Chart */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              {reportType === 'performance' ? 'Performance Overview' : 
               reportType === 'attendance' ? 'Attendance Analytics' : 
               reportType === 'salary' ? 'Salary Distribution' : 
               'Department Metrics'}
              {reportType === 'salary' && !isAdmin && (
                <span className="ml-2 text-sm font-normal text-secondary-500">
                  (Admin access required)
                </span>
              )}
            </h2>
            {(reportType === 'salary' && !isAdmin) ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-secondary-400">
                <FiAlertCircle size={48} className="mb-4" />
                <p className="text-lg font-medium">Access Restricted</p>
                <p className="text-sm">Salary reports are only available for administrators</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setReportType('performance')}
                >
                  View Performance Report Instead
                </Button>
              </div>
            ) : getChartData() && getChartData().length > 0 ? (
              <Chart
                type={getChartType()}
                data={getChartData()}
                dataKey={getChartDataKey()}
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-secondary-400">
                No data available for the selected period
              </div>
            )}
          </Card>
        </div>
      </StaggerChildren>
    </div>
  );
};

export default Reports;
