import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = [
  "#1A3A6E", 
  "#2A7CFF",  
  "#FF69B4",  
  "#C400FF",  
  "#00CC99", 
  "#FFCC00", 
  "#FF8800", 
  "#FF4444",  
  "#FFDD44"   
];

const DepartmentPieChart = ({ data, loading = false }) => {
  if (loading) {
    return <div className="skeleton h-[300px] w-full rounded-lg" />;
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500">No department data available</p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default DepartmentPieChart;
