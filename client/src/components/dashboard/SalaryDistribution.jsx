import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const SalaryDistribution = ({ data, loading = false }) => {
  if (loading) {
    return <div className="skeleton h-[300px] w-full rounded-lg" />;
  }
  
  const defaultData = [
    { range: '0-50k', count: 15 },
    { range: '50-100k', count: 35 },
    { range: '100-150k', count: 45 },
    { range: '150-200k', count: 25 },
    { range: '200k+', count: 10 },
  ];
  
  const COLORS = [
  "#4A2C8A",  
  "#8A6BC6",  
  "#4A9A8A", 
  "#1A6A99",  
  "#C46A2A", 
  "#4AC46A",  
  "#B0B0B0",  
]

const formatRange = (range) => {
    if (!range) return '';
    if (range.includes('+')) {
      return `$${range}`;                   
    }
    const [min, max] = range.split('-');
    return `$${min} - $${max}`;     
  };
  const chartData = data || defaultData;
  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="range" stroke="#6b7280" />
          <YAxis stroke="#6b7280"
          tickCount={6}/>
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value) => [value, 'Count']}
            labelFormatter={(label) => formatRange(label)}
          />
          <Bar dataKey="count" fill="#f9a155" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SalaryDistribution;
