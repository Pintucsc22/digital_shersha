// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const API_URL= import.meta.env.VITE_API_URL || "http://localhost:5000";

  // -------------------------
  // Check login
  // -------------------------
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("Checking stored user:", storedUser);
    if (!storedUser || storedUser.role !== "student") {
      console.warn("User not logged in or not student. Redirecting...");
      navigate("/?auth=login");
    } else {
      setStudent(storedUser);
    }
  }, [navigate]);

  // -------------------------
  // Fetch exams
  // -------------------------
  useEffect(() => {
    const fetchExams = async () => {
      const token = localStorage.getItem("token");
      console.log("Fetching exams with token:", token);
      try {
        const res = await fetch(`${API_URL}/api/student/exams`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        console.log("Exams fetch status:", res.status);
        if (!res.ok) throw new Error("Failed to fetch exams");

        const data = await res.json();
        console.log("Exams fetched:", data);

        const mappedExams = data.map((exam) => {
          const assigned = exam.assignedTo?.find(
            (a) => a.studentId?._id?.toString() === student._id
          );

          const attempts = assigned?.attempts ?? 0;
          const submitted = assigned?.submitted ?? false;
          const isActive = assigned?.isActive ?? false;
          const isAssigned = !!assigned;

          console.log(`Exam ${exam.examName}:`, { attempts, submitted, isActive, isAssigned });

          return {
            ...exam,
            studentProgress: { attempts, submitted, isActive, isAssigned },
          };
        });

        setAvailableExams(mappedExams);
      } catch (err) {
        console.error("Error fetching exams:", err);
      } finally {
        setLoadingExams(false);
      }
    };

    if (student) fetchExams();
  }, [student]);

  // -------------------------
  // Fetch results
  // -------------------------
  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem("token");
      console.log("Fetching results with token:", token);
      try {
        const res = await fetch(`${API_URL}/api/student/results`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        console.log("Results fetch status:", res.status);
        if (!res.ok) throw new Error("Failed to fetch results");

        const data = await res.json();
        console.log("Results fetched:", data);
        setResults(data);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoadingResults(false);
      }
    };

    if (student) fetchResults();
  }, [student]);

  // -------------------------
  // Determine button / badge status
  // -------------------------
  const getExamStatus = (exam) => {
    const progress = exam.studentProgress || {};
    const today = dayjs().startOf("day");
    const examDay = dayjs(exam.date).startOf("day");
    const unlocked = !examDay.isAfter(today);

    console.log(`Exam status for ${exam.examName}:`, progress, "Unlocked:", unlocked);

    if (!progress.isAssigned) {
      return { type: "badge", text: "Not Assigned", style: "bg-yellow-100 text-yellow-800" };
    }
    if (!progress.isActive) {
      return { type: "button", disabled: true, text: "🔒 Locked by Teacher", style: "bg-gray-300 text-gray-500 cursor-not-allowed" };
    }
    if (!unlocked) {
      return { type: "button", disabled: true, text: "🔒 Locked (Not Started)", style: "bg-gray-300 text-gray-500 cursor-not-allowed" };
    }
    if (progress.submitted) {
      return { type: "badge", text: "Submitted", style: "bg-green-100 text-green-700" };
    }
    return { type: "button", disabled: false, text: "Start", style: "bg-blue-500 hover:bg-blue-600 text-white" };
  };

  // -------------------------
  // Start exam handler
  // -------------------------
  const handleStartExam = async (examId) => {
    const token = localStorage.getItem("token");
    console.log("Attempting to start exam:", examId);

    try {
      const res = await fetch(`${API_URL}/api/student/exam/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store", // always fetch fresh
      });

      console.log("Start exam fetch status:", res.status);

      if (!res.ok) {
        console.warn("Cannot start exam:", res.statusText);
        alert("Cannot start exam: " + res.statusText);
        return;
      }

      const examData = await res.json();
      console.log("Exam data received:", examData);

      if (!examData.isActive) {
        console.warn("Exam is not active");
        alert("Cannot start exam: Exam is not active.");
        return;
      }

      if (examData.remainingAttempts <= 0) {
        console.warn("Maximum attempts reached");
        alert("Cannot start exam: Maximum attempts reached.");
        return;
      }

      console.log("Navigating to exam page with exam data:", `/student/exam/${examId}`);
      navigate(`/student/exam/${examId}`, { state: { examData } }); // <-- pass examData
    } catch (err) {
      console.error("Error starting exam:", err);
      alert("Something went wrong. Try again.");
    }
  };

  // -------------------------
  // Logout
  // -------------------------
  const handleLogout = () => {
    console.log("Logging out student");
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
                const status = getExamStatus(exam);
                return (
                  <li
                    key={exam._id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-3 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      <span className="text-sm md:text-base text-gray-700 font-medium">
                        {exam.examName}{" "}
                        <span className="text-gray-500 text-xs md:text-sm">
                          ({dayjs(exam.date).format("YYYY-MM-DD")})
                        </span>
                      </span>
                    </div>

                    {status.type === "badge" ? (
                      <span
                        className={`mt-2 md:mt-0 inline-block px-3 py-1 rounded-lg text-sm font-medium shadow ${status.style}`}
                      >
                        {status.text}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStartExam(exam._id)}
                        disabled={status.disabled}
                        className={`mt-2 md:mt-0 w-full md:w-auto px-4 py-1 rounded-lg text-sm font-medium shadow transition ${status.style}`}
                      >
                        {status.text}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No exams available right now.</p>
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
                        pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
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
