import  { useEffect } from 'react';
import { FiArrowRight, FiBarChart2, FiFileText, FiShield, FiUsers, FiUserCheck, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import StatsCard from '../components/dashboard/StatsCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import DepartmentPieChart from '../components/dashboard/DepartmentPieChart';
import SalaryDistribution from '../components/dashboard/SalaryDistribution';
import { useDashboardStore } from '../store/dashboardStore';
import { useToast } from '../context/ToastContext';
import { FadeIn, SlideIn, StaggerChildren } from '../components/animations';
import { useAuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuthContext();
  const { 
    stats, 
    performance, 
    salaryDistribution, 
    recentActivity, 
    isLoading, 
    fetchDashboardData 
  } = useDashboardStore();
  const { error: showError } = useToast();
  const isDemoSession = searchParams.get('demo') === '1' || user?.demo?.isDemoAccount;
  
  useEffect(() => {
    fetchDashboardData().catch(err => showError('Failed to load dashboard data'));
  }, []);
  
  const statsData = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      change: '+12%',
      icon: <FiUsers size={34} className="text-white bg-amber-950 p-2 rounded" />,
      color: 'primary',
    },
    {
      title: 'Active Employees',
      value: stats?.activeEmployees || 0,
      change: '+5%',
      icon: <FiUserCheck size={34} className="text-white bg-amber-950 p-2 rounded" />,
      color: 'success',
    },
    {
      title: 'Average Performance',
      value: `${stats?.averagePerformance || 0}%`,
      change: '+8%',
      icon: <FiTrendingUp size={34} className="text-white bg-amber-950 p-2 rounded" />,
      color: 'warning',
    },
    {
      title: 'Total Payroll',
      value: `$${stats?.totalPayroll?.toLocaleString() || 0}`,
      change: '+15%',
      icon: <FiDollarSign size={34} className="text-white bg-amber-950 p-2 rounded" />,
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

      {isDemoSession && (
        <FadeIn delay={0.05}>
          <section className="mb-8 rounded-lg border border-primary-200 bg-white p-5 shadow-soft">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-2">
                  Demo workspace quick start
                </p>
                <h2 className="text-xl font-bold text-secondary-900 mb-2">
                  Explore the core platform workflows in minutes.
                </h2>
                <p className="text-secondary-600 max-w-3xl">
                  This workspace is pre-populated with employees, departments,
                  skills, performance reviews, payroll distribution, and audit
                  activity so you can try the platform without setup.
                </p>
              </div>
              <Link to="/about-project" className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-secondary-900 px-4 py-2 text-white hover:bg-secondary-800">
                About platform
                <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5">
              {[
                { icon: <FiBarChart2 />, label: 'Dashboard analytics', to: '/app/dashboard' },
                { icon: <FiUsers />, label: 'Employee records', to: '/app/employees' },
                { icon: <FiFileText />, label: 'Reports', to: '/app/reports' },
                { icon: <FiShield />, label: 'Audit activity', to: '/app/settings' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg border border-secondary-200 bg-secondary-50 p-3 text-secondary-800 hover:border-primary-300 hover:bg-primary-50"
                >
                  <span className="text-primary-600">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </FadeIn>
      )}
      
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
