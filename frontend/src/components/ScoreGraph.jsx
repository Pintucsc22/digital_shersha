import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const data = [
  { year: '2019', score: 78 },
  { year: '2020', score: 82 },
  { year: '2021', score: 85 },
  { year: '2022', score: 88 },
  { year: '2023', score: 91 }
];

const ScoreGraph = () => (
  <div>
    <h3 className="text-lg font-semibold mb-2">Performance Over Years</h3>
    <LineChart width={300} height={200} data={data}>
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="year" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="score" stroke="#8884d8" />
    </LineChart>
  </div>
);

export default ScoreGraph;
