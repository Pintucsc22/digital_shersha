import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LabelList, Cell 
} from 'recharts';

// Dummy top students data
const topStudents = [
  { name: 'Alice', examsCompleted: 5 },
  { name: 'Bob', examsCompleted: 3 },
];

// Color based on rank
const getBarColor = (index, isHovered) => {
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
  if (index < 3) return colors[index];
  return isHovered ? '#fbbf24' : '#facc15'; // Hovered vs default yellow
};

const LeaderboardChart = ({ data = topStudents }) => {
  const [hoverIndex, setHoverIndex] = React.useState(null);

  return (
    <div className="bg-gray-900 p-4 rounded-2xl shadow-lg w-full md:w-[450px] transition-transform duration-300 hover:scale-[1.02]">
      <h3 className="text-lg font-semibold mb-4 text-yellow-300 drop-shadow-md">
        Top 10 Students
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
        >
          <CartesianGrid stroke="#555" strokeDasharray="3 3" />
          <XAxis type="number" stroke="#ccc" tick={{ fill: '#eee' }} />
          <YAxis type="category" dataKey="name" stroke="#ccc" tick={{ fill: '#eee' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', color: '#fff' }}
            formatter={(value) => [`${value}`, 'Exams Completed']}
            labelFormatter={(label, payload) => {
              const rank = payload && payload.length ? payload[0].payload.index + 1 : '';
              return `Rank ${rank} - ${label}`;
            }}
          />
          <Bar
            dataKey="examsCompleted"
            barSize={18}
            radius={[8, 8, 8, 8]}
            onMouseEnter={(_, index) => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index, index === hoverIndex)} />
            ))}
            <LabelList dataKey="examsCompleted" position="right" fill="#fff" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeaderboardChart;
