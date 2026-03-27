import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const PerformanceChart = ({ data, loading = false }) => {
  if (loading) {
    return <div className="skeleton h-[300px] w-full rounded-lg" />;
  }
  
  const defaultData = [
    { month: 'Jan', performance: 75, target: 80 },
    { month: 'Feb', performance: 78, target: 82 },
    { month: 'Mar', performance: 82, target: 85 },
    { month: 'Apr', performance: 85, target: 88 },
    { month: 'May', performance: 88, target: 90 },
    { month: 'Jun', performance: 92, target: 92 },
  ];
  
  const chartData = data || defaultData;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="performance"
            stroke="#f9a155"
            strokeWidth={2}
            dot={{ fill: '#f9a155', r: 4 }}
            activeDot={{ r: 6 }}
            name="Actual Performance"
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#e88638"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#e88638', r: 4 }}
            name="Target"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default PerformanceChart;
