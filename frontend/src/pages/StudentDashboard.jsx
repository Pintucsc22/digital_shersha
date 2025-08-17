import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'student') {
      navigate('/?auth=login');
    } else {
      setStudent(storedUser);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchExams = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/student/exams', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch exams');
        const data = await res.json();
        setAvailableExams(data);
      } catch (err) {
        console.error('❌ Error fetching exams:', err);
      }
    };
    if (student) fetchExams();
  }, [student]);

  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/student/results', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch results');
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('❌ Error fetching results:', err);
      }
    };
    if (student) fetchResults();
  }, [student]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white shadow p-4 rounded mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Welcome, {student.name || 'Student'}!
        </h1>
        <p className="text-xl font-bold text-gray-800">
          ID: {student.userId} | Class: {student.className || 'N/A'}
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Exams */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Available Exams</h2>
          {availableExams.length > 0 ? (
            <ul className="text-sm text-gray-700 space-y-1">
              {availableExams.map((exam) => (
                <li key={exam._id} className="flex justify-between items-center">
                  <span>
                    {exam.examName} - {new Date(exam.date).toLocaleString()}
                  </span>
                  <button
                    onClick={() => navigate(`/student/exam/${exam._id}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Start
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No exams available right now.</p>
          )}
        </div>

        {/* Student Results */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">My Results</h2>
          {results.length > 0 ? (
            <ul className="text-sm text-gray-700 space-y-2">
              {results.map((r) => (
                <li
                  key={r.submissionId}
                  className="flex justify-between items-center border-b pb-1"
                >
                  <span>
                    {r.examName} ({r.topic})
                  </span>
                  <div>
                    <span className="font-bold text-green-600">
                      Score: {r.score}/{r.total}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No results available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
