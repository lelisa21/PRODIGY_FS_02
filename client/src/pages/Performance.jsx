import { useEffect, useState } from 'react';
import { FadeIn, SlideIn } from '../components/animations';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import { useToast } from '../context/ToastContext';
import dashboardService from '../services/dashboard.service';

const Performance = () => {
  const { error: showError } = useToast();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getPerformance();
        setPerformance(response.data);
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showError]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Performance</h1>
          <p className="text-secondary-600 mt-1">Organization-wide performance trends</p>
        </div>
      </FadeIn>

      <SlideIn direction="up">
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Performance Trend</h2>
          <PerformanceChart data={performance} loading={loading} />
        </div>
      </SlideIn>
    </div>
  );
};

export default Performance;
