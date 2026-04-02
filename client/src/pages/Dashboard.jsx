import  { useEffect } from 'react';
import { FiUsers, FiUserCheck, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import StatsCard from '../components/dashboard/StatsCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import DepartmentPieChart from '../components/dashboard/DepartmentPieChart';
import SalaryDistribution from '../components/dashboard/SalaryDistribution';
import { useDashboardStore } from '../store/dashboardStore';
import { useToast } from '../context/ToastContext';
import { FadeIn, SlideIn, StaggerChildren } from '../components/animations';

const Dashboard = () => {
  const { 
    stats, 
    performance, 
    salaryDistribution, 
    recentActivity, 
    isLoading, 
    fetchDashboardData 
  } = useDashboardStore();
  const { error: showError } = useToast();
  
  useEffect(() => {
    fetchDashboardData().catch(err => showError('Failed to load dashboard data'));
  }, []);
  
  const statsData = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      change: '+12%',
      icon: <FiUsers size={24} className="text-white" />,
      color: 'primary',
    },
    {
      title: 'Active Employees',
      value: stats?.activeEmployees || 0,
      change: '+5%',
      icon: <FiUserCheck size={24} className="text-white" />,
      color: 'success',
    },
    {
      title: 'Average Performance',
      value: `${stats?.averagePerformance || 0}%`,
      change: '+8%',
      icon: <FiTrendingUp size={24} className="text-white" />,
      color: 'warning',
    },
    {
      title: 'Total Payroll',
      value: `$${stats?.totalPayroll?.toLocaleString() || 0}`,
      change: '+15%',
      icon: <FiDollarSign size={24} className="text-white" />,
      color: 'info',
    },
  ];
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600 mt-1">Welcome back! Here's what's happening with your organization.</p>
        </div>
      </FadeIn>
      
      <StaggerChildren staggerDelay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              {...stat}
              loading={isLoading}
            />
          ))}
        </div>
      </StaggerChildren>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SlideIn direction="left" delay={0.2}>
          <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Performance Trend</h2>
            <PerformanceChart data={performance} loading={isLoading} />
          </div>
        </SlideIn>
        
        <SlideIn direction="right" delay={0.3}>
          <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Department Distribution</h2>
            <DepartmentPieChart data={salaryDistribution?.departments} loading={isLoading} />
          </div>
        </SlideIn>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.4}>
          <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h2>
            <ActivityFeed activities={recentActivity} loading={isLoading} />
          </div>
        </FadeIn>
        
        <FadeIn delay={0.5}>
          <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Salary Distribution</h2>
            <SalaryDistribution data={salaryDistribution?.ranges} loading={isLoading} />
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default Dashboard;
