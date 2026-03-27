import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiCalendar, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Chart from '../components/dashboard/Chart';
import { FadeIn, StaggerChildren } from '../components/animations';

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('performance');
  
  const performanceData = [
    { month: 'Jan', performance: 75, target: 80 },
    { month: 'Feb', performance: 78, target: 82 },
    { month: 'Mar', performance: 82, target: 85 },
    { month: 'Apr', performance: 85, target: 88 },
    { month: 'May', performance: 88, target: 90 },
    { month: 'Jun', performance: 92, target: 92 },
  ];
  
  const attendanceData = [
    { month: 'Jan', present: 92, absent: 8 },
    { month: 'Feb', present: 94, absent: 6 },
    { month: 'Mar', present: 91, absent: 9 },
    { month: 'Apr', present: 95, absent: 5 },
    { month: 'May', present: 93, absent: 7 },
    { month: 'Jun', present: 96, absent: 4 },
  ];
  
  const reportTypes = [
    { id: 'performance', label: 'Performance Report', icon: <FiBarChart2 /> },
    { id: 'attendance', label: 'Attendance Report', icon: <FiCalendar /> },
    { id: 'salary', label: 'Salary Report', icon: <FiPieChart /> },
  ];
  
  const dateRanges = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last 12 Months' },
  ];
  
  const handleExport = () => {
    // Handle export logic
    alert('Export started');
  };
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FadeIn>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Reports & Analytics</h1>
            <p className="text-secondary-600 mt-1">Generate and analyze organizational reports</p>
          </div>
          <Button variant="primary" icon={<FiDownload />} onClick={handleExport}>
            Export Report
          </Button>
        </div>
      </FadeIn>
      
      {/* Report Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4">
          <label className="block text-sm font-medium text-secondary-700 mb-2">Report Type</label>
          <div className="flex gap-2">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  reportType === type.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                {type.icon}
                <span className="text-sm">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4">
          <label className="block text-sm font-medium text-secondary-700 mb-2">Date Range</label>
          <div className="flex gap-2">
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
                <span className="text-sm">{range.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <StaggerChildren staggerDelay={0.1}>
        <div className="space-y-6">
          {/* Main Chart */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              {reportType === 'performance' ? 'Performance Overview' : 
               reportType === 'attendance' ? 'Attendance Analytics' : 
               'Salary Distribution'}
            </h2>
            <Chart
              type="line"
              data={reportType === 'performance' ? performanceData : attendanceData}
              dataKey={reportType === 'performance' ? ['performance', 'target'] : ['present', 'absent']}
              height={350}
            />
          </Card>
          
          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-center">
                <p className="text-sm text-secondary-500 mb-1">Average Performance</p>
                <p className="text-3xl font-bold text-secondary-900">85%</p>
                <p className="text-xs text-success-600 mt-1">↑ 8% from last month</p>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <p className="text-sm text-secondary-500 mb-1">Attendance Rate</p>
                <p className="text-3xl font-bold text-secondary-900">93.5%</p>
                <p className="text-xs text-success-600 mt-1">↑ 2.5% from last month</p>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <p className="text-sm text-secondary-500 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-secondary-900">245</p>
                <p className="text-xs text-success-600 mt-1">↑ 12 new hires</p>
              </div>
            </Card>
          </div>
        </div>
      </StaggerChildren>
    </div>
  );
};

export default Reports;
