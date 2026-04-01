import { useEffect, useState } from 'react';
import { FiBriefcase } from 'react-icons/fi';
import { useEmployeeContext } from '../context/EmployeeContext';
import { useToast } from '../context/ToastContext';
import { FadeIn, SlideIn } from '../components/animations';

const Departments = () => {
  const { getDepartmentStats } = useEmployeeContext();
  const { error: showError } = useToast();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await getDepartmentStats();
      if (result.success) {
        setStats(result.data || []);
      } else {
        showError(result.error || 'Failed to load department stats');
      }
      setLoading(false);
    };
    load();
  }, [getDepartmentStats, showError]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Departments</h1>
          <p className="text-secondary-600 mt-1">Department-level insights and headcount</p>
        </div>
      </FadeIn>

      <SlideIn direction="up">
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 overflow-hidden">
          {loading ? (
            <div className="p-6">
              <div className="skeleton h-64 rounded-lg" />
            </div>
          ) : stats.length === 0 ? (
            <div className="p-8 text-center text-secondary-500">
              No department data available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Avg Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Avg Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Utilization
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {stats.map((dept, idx) => (
                    <tr key={dept.department || idx} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 text-sm font-medium text-secondary-900">
                        <div className="flex items-center gap-2">
                          <FiBriefcase className="text-primary-500" />
                          {dept.department || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-700">{dept.totalEmployees}</td>
                      <td className="px-6 py-4 text-sm text-secondary-700">
                        ${Number(dept.avgSalary || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-700">
                        {dept.avgRating || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-700">
                        {dept.utilizationRate || 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SlideIn>
    </div>
  );
};

export default Departments;
