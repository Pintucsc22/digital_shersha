import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LeaderboardChart from './LeaderboardChart';

const API_URL= import.meta.env.VITE_API_URL || "http://localhost:5000";

const LeaderboardWrapper = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTopStudents = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/top-students`);
        // Map backend data to include index for rank
        const studentsWithIndex = res.data.map((student, idx) => ({
          ...student,
          index: idx,
        }));
        setData(studentsWithIndex);
      } catch (err) {
        console.error('Failed to fetch top students:', err);
      }
    };

    fetchTopStudents();
  }, []);

  return <LeaderboardChart data={data} />;
};

export default LeaderboardWrapper;
