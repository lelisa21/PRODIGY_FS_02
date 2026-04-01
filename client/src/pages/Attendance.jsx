import { useEffect, useState } from 'react';
import { FiCalendar, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { FadeIn, SlideIn } from '../components/animations';
import { useToast } from '../context/ToastContext';
import dashboardService from '../services/dashboard.service';

const Attendance = () => {
  const { error: showError } = useToast();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getAttendanceStats();
        setAttendance(response.data);
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to load attendance stats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showError]);

  const cards = [
    { label: 'Total Leaves', value: attendance?.totalLeaves || 0, icon: <FiCalendar /> },
    { label: 'Leaves Taken', value: attendance?.leavesTaken || 0, icon: <FiCheckCircle /> },
    { label: 'Late Days', value: attendance?.lateDays || 0, icon: <FiClock /> },
    { label: 'Absent Days', value: attendance?.absentDays || 0, icon: <FiXCircle /> },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Attendance</h1>
          <p className="text-secondary-600 mt-1">Attendance summary across the organization</p>
        </div>
      </FadeIn>

      {loading ? (
        <div className="skeleton h-64 rounded-lg" />
      ) : (
        <SlideIn direction="up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs text-secondary-500">{card.label}</p>
                  <p className="text-lg font-semibold text-secondary-900">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SlideIn>
      )}

      {!loading && attendance && (
        <SlideIn direction="up" delay={0.1}>
          <div className="mt-6 bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Utilization Rate</h2>
            <div className="w-full bg-secondary-100 rounded-full h-3">
              <div
                className="bg-primary-500 h-3 rounded-full"
                style={{ width: `${attendance.utilizationRate || 0}%` }}
              />
            </div>
            <p className="text-sm text-secondary-600 mt-2">
              {attendance.utilizationRate || 0}% of available leaves used
            </p>
          </div>
        </SlideIn>
      )}
    </div>
  );
};

export default Attendance;
