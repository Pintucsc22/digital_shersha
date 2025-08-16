import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const StudentExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [mcqs, setMcqs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [examName, setExamName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const storedSubmitted = localStorage.getItem(`exam-${examId}-submitted`);
    if (storedSubmitted === "true") setSubmitted(true);
  }, [examId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/student-dashboard", { replace: true });
  }, [navigate]);

  const fetchMCQs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/student/exam/${examId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("[DEBUG] Fetched MCQs:", res.data);
      setExamName(res.data.examName || "Exam");
      setMcqs(Array.isArray(res.data.questions) ? res.data.questions : []);
    } catch (err) {
      console.error("Error fetching exam MCQs:", err);
      alert("Failed to load exam. Redirecting to dashboard.");
      navigate("/student-dashboard", { replace: true });
    }
  };

  useEffect(() => {
    fetchMCQs();
  }, [examId]);

  useEffect(() => {
    const handleVisibility = async () => {
      if (document.hidden && !submitted) {
        try {
          console.log("[DEBUG] Auto-submitting exam due to tab visibility change");

          const numericAnswers = {};
          mcqs.forEach(q => {
            numericAnswers[q._id] = answers[q._id] !== undefined ? Number(answers[q._id]) : -1;
          });

          const token = localStorage.getItem("token");
          const res = await axios.post(
            `http://localhost:5000/api/student/exam/${examId}/submit`,
            { answers: numericAnswers },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          console.log("[DEBUG] Auto-submit response:", res.data);
          localStorage.setItem(`exam-${examId}-submitted`, "true");
          setSubmitted(true);
          alert("Exam minimized! Your answers were auto-submitted.");
        } catch (err) {
          console.error("Auto-submit failed:", err);
          alert("Exam minimized! Could not auto-submit answers.");
        } finally {
          navigate("/student-dashboard", { replace: true });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [answers, mcqs, examId, navigate, submitted]);

  const handleSelect = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    console.log("[DEBUG] Selected answer:", questionId, optionIndex);
  };

  const handleSubmit = async () => {
    try {
      console.log("[DEBUG] Manual submit triggered");

      const numericAnswers = {};
      mcqs.forEach(q => {
        numericAnswers[q._id] = answers[q._id] !== undefined ? Number(answers[q._id]) : -1;
      });

      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/student/exam/${examId}/submit`,
        { answers: numericAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("[DEBUG] Submit response:", res.data);
      localStorage.setItem(`exam-${examId}-submitted`, "true");
      setSubmitted(true);
      setAnswers({});
      alert("Exam submitted successfully!");
      navigate("/student-dashboard", { replace: true });
    } catch (err) {
      console.error("Error submitting exam:", err);
      alert("Failed to submit exam. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">{examName}</h1>

      {mcqs.length === 0 && <p>Loading exam questions...</p>}

      {mcqs.map((q, idx) => (
        <div key={q._id} className="bg-white shadow rounded p-4 mb-4">
          <p className="font-semibold">{idx + 1}. {q.question}</p>
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
                />
                <span>{String.fromCharCode(65 + i)}. {opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {mcqs.length > 0 && !submitted && (
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Submit Exam
        </button>
      )}
    </div>
  );
};

export default StudentExamPage;
