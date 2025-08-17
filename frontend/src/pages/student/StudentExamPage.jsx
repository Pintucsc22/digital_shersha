// src/pages/StudentExamPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const StudentExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [mcqs, setMcqs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [examName, setExamName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const [warning, setWarning] = useState(false);
  const timerRef = useRef(null);

  // Check if already submitted from localStorage
  useEffect(() => {
    const storedSubmitted = localStorage.getItem(`exam-${examId}-submitted`);
    if (storedSubmitted === "true") setSubmitted(true);
  }, [examId]);

  // Ensure student is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/student-dashboard", { replace: true });
  }, [navigate]);

  // Fetch exam MCQs
  const fetchMCQs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/student/exam/${examId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setExamName(res.data.examName || "Exam");
      const questions = Array.isArray(res.data.questions) ? res.data.questions : [];
      setMcqs(questions);

      if (!submitted) {
        // Restore timeLeft from localStorage if available
        const storedTime = localStorage.getItem(`exam-${examId}-timeLeft`);
        if (storedTime) {
          setTimeLeft(Number(storedTime));
        } else if (res.data.duration) {
          setTimeLeft(res.data.duration * 60); // minutes → seconds
        }
      }
    } catch (err) {
      console.error("Error fetching exam MCQs:", err);
      alert("Failed to load exam. Redirecting to dashboard.");
      navigate("/student-dashboard", { replace: true });
    }
  };

  useEffect(() => {
    fetchMCQs();
  }, [examId]);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft === null || submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(); // auto-submit
          return 0;
        }
        if (prev <= 120) setWarning(true); // show warning in last 2 minutes

        // Persist timer in localStorage
        localStorage.setItem(`exam-${examId}-timeLeft`, prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, submitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Warn user on page/tab close or navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [submitted]);

  // Auto-submit on tab visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !submitted) {
        console.log("[DEBUG] Auto-submitting exam due to tab change");
        handleSubmit();
        alert(
          "Exam minimized! Your answers were auto-submitted for security reasons."
        );
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [answers, mcqs, examId, submitted]);

  // Handle answer selection
  const handleSelect = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  // Submit exam
  const handleSubmit = async () => {
    if (submitted) return;

    try {
      const numericAnswers = {};
      mcqs.forEach((q) => {
        numericAnswers[q._id] =
          answers[q._id] !== undefined ? Number(answers[q._id]) : -1;
      });

      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/student/exam/${examId}/submit`,
        { answers: numericAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem(`exam-${examId}-submitted`, "true");
      localStorage.removeItem(`exam-${examId}-timeLeft`);
      setSubmitted(true);
      setAnswers({});
      clearInterval(timerRef.current);
      alert("Exam submitted successfully!");
      navigate("/student-dashboard", { replace: true });
    } catch (err) {
      console.error("Error submitting exam:", err);
      alert("Failed to submit exam. Please try again.");
    }
  };

  const answeredCount = Object.keys(answers).length;

  if (submitted)
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <h2 className="text-xl font-bold text-gray-800">
          You have already submitted this exam.
        </h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{examName}</h1>
        {timeLeft !== null && (
          <span
            className={`text-lg font-semibold ${
              warning ? "text-red-700 animate-pulse" : "text-red-600"
            }`}
          >
            Time Left: {formatTime(timeLeft)} | Total Questions: {mcqs.length}
          </span>
        )}
      </div>

      <p className="mb-4 font-medium">
        Answered: {answeredCount}/{mcqs.length} questions
      </p>

      {mcqs.length === 0 && <p>Loading exam questions...</p>}

      {mcqs.map((q, idx) => (
        <div key={q._id} className="bg-white shadow rounded p-4 mb-4">
          <p className="font-semibold">
            {idx + 1}. {q.question}
          </p>
          <div className="mt-2 space-y-2">
            {q.options.map((opt, i) => (
              <label key={i} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={q._id}
                  value={i}
                  checked={answers[q._id] === i}
                  onChange={() => handleSelect(q._id, i)}
                  className="form-radio"
                  disabled={submitted}
                  aria-label={`Option ${String.fromCharCode(65 + i)} for question ${
                    idx + 1
                  }`}
                />
                <span>{String.fromCharCode(65 + i)}. {opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {mcqs.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={answeredCount === 0}
          className={`px-4 py-2 rounded text-white ${
            answeredCount === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          Submit Exam
        </button>
      )}
    </div>
  );
};

export default StudentExamPage;
