// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs"; // ✅ DayJS for date comparison

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);

  // Check login
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "student") {
      navigate("/?auth=login");
    } else {
      setStudent(storedUser);
    }
  }, [navigate]);

  // Fetch exams
  useEffect(() => {
    const fetchExams = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/api/student/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch exams");
        const data = await res.json();
        setAvailableExams(data);
      } catch (err) {
        console.error("❌ Error fetching exams:", err);
      } finally {
        setLoadingExams(false);
      }
    };
    if (student) fetchExams();
  }, [student]);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/api/student/results", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch results");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("❌ Error fetching results:", err);
      } finally {
        setLoadingResults(false);
      }
    };
    if (student) fetchResults();
  }, [student]);

  // Check if exam already submitted
  const isExamSubmitted = (exam) => {
    const localSubmitted = localStorage.getItem(`exam-${exam._id}-submitted`);
    if (localSubmitted === "true") return true;

    const result = results.find((r) =>
      [r.examId, r.exam?._id, r.exam]
        .filter(Boolean)
        .some((id) => String(id) === String(exam._id))
    );
    return !!(result && (result.score !== undefined && result.score !== null));
  };

  // ✅ Lock only future exams (use creation date for unlock)
  const isExamUnlocked = (exam) => {
    const today = dayjs().startOf("day");             // Today at 00:00
    const examDay = dayjs(exam.date).startOf("day");  // creation date
    return !examDay.isAfter(today);                   // Unlock if created on/before today
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-3 md:p-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white shadow-md p-4 rounded-2xl mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-indigo-700 mb-2 md:mb-0">
          Welcome, {student.name || "Student"} 👋
        </h1>
        <p className="text-sm md:text-base font-medium text-gray-600 mb-2 md:mb-0">
          ID: {student.userId} | Class: {student.className || "N/A"}
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm md:text-base hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Exams */}
        <div className="bg-white shadow-lg rounded-2xl p-4">
          <h2 className="text-lg font-semibold mb-3 border-b pb-2 text-indigo-600">
            📘 Available Exams
          </h2>
          {loadingExams ? (
            <p className="text-gray-500">Loading exams...</p>
          ) : availableExams.length > 0 ? (
            <ul className="space-y-3">
              {availableExams.map((exam) => {
                const submitted = isExamSubmitted(exam);
                const unlocked = isExamUnlocked(exam);

                return (
                  <li
                    key={exam._id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-3 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <span className="text-sm md:text-base text-gray-700 font-medium">
                      {exam.examName}{" "}
                      <span className="text-gray-500 text-xs md:text-sm">
                        ({dayjs(exam.date).format("YYYY-MM-DD")})
                      </span>
                    </span>

                    {submitted ? (
                      <span className="mt-2 md:mt-0 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium shadow">
                        ✅ Submitted
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate(`/student/exam/${exam._id}`)}
                        disabled={!unlocked}
                        className={`mt-2 md:mt-0 w-full md:w-auto px-4 py-1 rounded-lg text-sm font-medium shadow transition ${
                          unlocked
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {unlocked ? "Start" : "🔒 Locked"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">
              No exams available right now.
            </p>
          )}
        </div>

        {/* Student Results */}
        <div className="bg-white shadow-lg rounded-2xl p-4">
          <h2 className="text-lg font-semibold mb-3 border-b pb-2 text-indigo-600">
            📊 My Results
          </h2>
          {loadingResults ? (
            <p className="text-gray-500">Loading results...</p>
          ) : results.length > 0 ? (
            <ul className="space-y-3">
              {results.map((r) => {
                const pass = r.score >= r.total / 2;
                return (
                  <li
                    key={r.submissionId}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-3 rounded-xl shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm md:text-base text-gray-700 font-medium">
                      {r.examName}{" "}
                      <span className="text-gray-500 text-xs md:text-sm">
                        ({r.topic})
                      </span>
                    </span>
                    <span
                      className={`mt-2 md:mt-0 font-bold px-3 py-1 rounded-lg text-sm shadow ${
                        pass
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      Score: {r.score}/{r.total} — {pass ? "Pass" : "Fail"}
                    </span>
                  </li>
                );
              })}
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
