// src/pages/StudentExamPage.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const QuestionCard = ({ question, idx, selected, onSelect, id }) => (
  <div id={id} className="bg-white shadow rounded p-4 mb-4">
    <p className="font-semibold">{idx + 1}. {question.question}</p>
    <div className="mt-2 space-y-2">
      {question.options.map((opt, i) => (
        <label
          key={i}
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-all hover:bg-gray-50 ${selected === i ? "bg-blue-100 border border-blue-300" : ""}`}
        >
          <input
            type="radio"
            name={question._id}
            value={i}
            checked={selected === i}
            onChange={() => onSelect(question._id, i)}
            className="form-radio"
            aria-label={`Option ${String.fromCharCode(65 + i)} for question ${idx + 1}`}
          />
          <span className={`${selected === i ? "font-bold text-blue-600" : ""}`}>
            {String.fromCharCode(65 + i)}. {opt}
          </span>
        </label>
      ))}
    </div>
  </div>
);
const API_URL= import.meta.env.VITE_API_URL || "http://localhost:5000";
const StudentExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const examDataFromState = location.state?.examData;

  const [mcqs, setMcqs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [examName, setExamName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [warning, setWarning] = useState(false);
  const [examStarted, setExamStarted] = useState(false); 
  const [attempts, setAttempts] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Check if exam already submitted
  useEffect(() => {
    const storedSubmitted = localStorage.getItem(`exam-${examId}-submitted`);
    if (storedSubmitted === "true") setSubmitted(true);
  }, [examId]);

  // Redirect after submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        navigate("/student-dashboard", { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitted, navigate]);

  // Ensure student is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/student-dashboard", { replace: true });
  }, [navigate]);

  // Fetch exam MCQs (only if no data passed)
  const fetchMCQs = useCallback(async () => {
    if (examDataFromState) {
      console.log("Using exam data from navigation state:", examDataFromState);
      setExamName(examDataFromState.examName || "Exam");
      setMcqs(Array.isArray(examDataFromState.questions) ? examDataFromState.questions : []);
      const progress = examDataFromState.studentProgress || {};
      setSubmitted(progress.submitted || false);
      setAttempts(progress.attempts || 0);
      setIsPublished(examDataFromState.assigned !== false);

      if (!progress.submitted) {
        const storedTime = localStorage.getItem(`exam-${examId}-timeLeft`);
        if (storedTime) setTimeLeft(Number(storedTime));
        else if (examDataFromState.duration) setTimeLeft(examDataFromState.duration * 60);

        const savedAnswers = localStorage.getItem(`exam-${examId}-answers`);
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
      }
      return;
    }

    console.log("Fetching exam data from API...");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/student/exam/${examId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Exam fetched:", res.data);

      setExamName(res.data.examName || "Exam");
      const questions = Array.isArray(res.data.questions) ? res.data.questions : [];
      setMcqs(questions);

      const progress = res.data.studentProgress || {};
      setSubmitted(progress.submitted || false);
      setAttempts(progress.attempts || 0);
      setIsPublished(res.data.assigned !== false);

      if (!progress.submitted) {
        const storedTime = localStorage.getItem(`exam-${examId}-timeLeft`);
        if (storedTime) setTimeLeft(Number(storedTime));
        else if (res.data.duration) setTimeLeft(res.data.duration * 60);

        const savedAnswers = localStorage.getItem(`exam-${examId}-answers`);
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
      }

      if ((progress.attempts >= 3) || !res.data.assigned) {
        alert("You cannot start this exam (Max attempts reached or assignment removed). Redirecting to dashboard.");
        navigate("/student-dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Error fetching exam MCQs:", err);
      alert("Failed to load exam. Redirecting to dashboard.");
      navigate("/student-dashboard", { replace: true });
    }
  }, [examId, navigate, examDataFromState]);

  useEffect(() => { fetchMCQs(); }, [fetchMCQs]);

  // Submit exam
  const handleSubmit = useCallback(async (auto = false) => {
    if (submitted) return;

    try {
      const numericAnswers = {};
      mcqs.forEach(q => {
        numericAnswers[q._id] = answers[q._id] !== undefined ? Number(answers[q._id]) : -1;
      });

      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/student/exam/${examId}/submit`,
        { answers: numericAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem(`exam-${examId}-submitted`, "true");
      localStorage.removeItem(`exam-${examId}-timeLeft`);
      localStorage.removeItem(`exam-${examId}-answers`);

      setSubmitted(true);
      clearInterval(timerRef.current);
      clearInterval(autoSaveRef.current);

      if (!auto) alert("Exam submitted successfully!");
      navigate("/student-dashboard", { replace: true });
    } catch (err) {
      console.error("Error submitting exam:", err);
      if (!auto) alert("Failed to submit exam. Please try again.");
    }
  }, [answers, mcqs, submitted, examId, navigate]);

  // Countdown Timer
  useEffect(() => {
    if (!examStarted || submitted || timeLeft === null) return;

    console.log("Starting exam timer with timeLeft:", timeLeft);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(); // auto-submit
          return 0;
        }
        if (prev <= 120) setWarning(true);
        localStorage.setItem(`exam-${examId}-timeLeft`, prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [submitted, timeLeft, handleSubmit, examStarted, examId]);

  // Auto-save answers
  useEffect(() => {
    if (!examStarted || submitted) return;
    autoSaveRef.current = setInterval(() => {
      localStorage.setItem(`exam-${examId}-answers`, JSON.stringify(answers));
    }, 60000);
    return () => clearInterval(autoSaveRef.current);
  }, [answers, submitted, examId, examStarted]);

  // Warn on page/tab close & block back
  useEffect(() => {
    const handleBeforeUnload = e => {
      if (!submitted && examStarted) {
        handleSubmit(true);
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const handlePopState = () => {
      if (!submitted && examStarted) {
        if (!window.confirm("Exam in progress! Are you sure you want to leave?")) {
          window.history.pushState(null, "", window.location.href);
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.href);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [submitted, handleSubmit, examStarted]);

  // Handle option select
  const handleSelect = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => {
      const updated = { ...prev, [questionId]: optionIndex };
      localStorage.setItem(`exam-${examId}-answers`, JSON.stringify(updated));
      return updated;
    });
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-800">
          You have already submitted this exam.
        </h2>
        <p className="text-gray-600 mt-2">Redirecting to dashboard in 5 seconds...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 relative">
      {!examStarted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Exam Instructions</h2>
            <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
              <li>Do not refresh the page or leave the exam tab.</li>
              <li>Do not use mobile back button or browser back button.</li>
              <li>Answers are auto-saved every 60 seconds.</li>
              <li>The exam will auto-submit when time is over.</li>
            </ul>
            <button
              onClick={() => setExamStarted(true)}
              disabled={!isPublished || attempts >= 3}
              className={`w-full ${(!isPublished || attempts >=3) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white font-bold py-2 px-4 rounded`}
            >
              I Understand, Start Exam
            </button>
          </div>
        </div>
      )}

      {examStarted && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sticky top-0 bg-gray-100 p-3 sm:p-2 z-50 shadow">
            <h1 className="text-2xl font-bold mb-1 sm:mb-0">{examName}</h1>
            {timeLeft !== null && (
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                <span className={`text-lg font-semibold ${warning ? "text-red-700 animate-pulse" : "text-red-600"}`}>
                  Time Left: {formatTime(timeLeft)}
                </span>
                <span className="text-gray-700 font-medium mt-1 sm:mt-0">
                  Total Questions: {mcqs.length} | Answered: {answeredCount}
                </span>
              </div>
            )}
          </div>

          {mcqs.length > 0 && (
            <div className="flex overflow-x-auto space-x-2 mb-4 py-1 px-1 sticky top-[72px] bg-gray-100 z-40 shadow-inner">
              {mcqs.map((q, idx) => (
                <button
                  key={q._id}
                  onClick={() => document.getElementById(`q-${idx}`)?.scrollIntoView({ behavior: "smooth" })}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border ${
                    answers[q._id] !== undefined ? "bg-green-400 text-white border-green-400" : "bg-gray-200 text-gray-700 border-gray-300"
                  } hover:ring-2 hover:ring-blue-400`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}

          {mcqs.map((q, idx) => (
            <QuestionCard
              key={q._id}
              question={q}
              idx={idx}
              selected={answers[q._id]}
              onSelect={handleSelect}
              id={`q-${idx}`}
            />
          ))}

          {mcqs.length > 0 && (
            <button
              onClick={() => handleSubmit(false)}
              disabled={answeredCount === 0}
              className={`w-full sm:w-auto px-4 py-3 mt-4 rounded text-white text-lg ${answeredCount === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
            >
              Submit Exam
            </button>
          )}

          <div className="fixed bottom-4 right-4 bg-green-200 text-green-800 px-3 py-1 rounded shadow text-sm">
            Answers auto-saved
          </div>
        </>
      )}
    </div>
  );
};

export default StudentExamPage;
