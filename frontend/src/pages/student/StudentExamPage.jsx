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
          className={`flex items-center space-x-3 p-3 rounded cursor-pointer transition-all hover:bg-gray-50 touch-manipulation ${selected === i ? "bg-blue-100 border border-blue-300" : ""}`}
        >
          <input
            type="radio"
            name={String(question._id)}
            value={i}
            checked={selected === i}
            onChange={() => onSelect(String(question._id), i)}
            className="form-radio w-5 h-5"
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  // refs to avoid stale closures
  const latestAnswersRef = useRef(answers);
  const submittingRef = useRef(false);
  const submitRef = useRef(null); // will store the latest submit function

  // keep latestAnswersRef in sync
  useEffect(() => { latestAnswersRef.current = answers; }, [answers]);

  // load local submitted flag
  useEffect(() => {
    const storedSubmitted = localStorage.getItem(`exam-${examId}-submitted`);
    if (storedSubmitted === "true") {
      console.debug("[ExamPage] local submitted flag found -> marking submitted");
      setSubmitted(true);
    }
  }, [examId]);

  // redirect to dashboard after submit (short delay so user sees message)
  useEffect(() => {
    if (submitted) {
      console.debug("[ExamPage] submitted -> redirecting to student dashboard in 2s");
      const t = setTimeout(() => navigate("/student-dashboard", { replace: true }), 2000);
      return () => clearTimeout(t);
    }
  }, [submitted, navigate]);

  // ensure authentication token (simple guard)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("[ExamPage] no token detected -> redirecting to dashboard");
      navigate("/student-dashboard", { replace: true });
    }
  }, [navigate]);

  // --- Fetch MCQs ---
  const fetchMCQs = useCallback(async () => {
    try {
      if (examDataFromState) {
        console.debug("[ExamPage] using navigation-state examData", examDataFromState);
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
          if (savedAnswers) {
            try { setAnswers(JSON.parse(savedAnswers)); } catch (err) { console.warn("[ExamPage] invalid saved answers JSON", err); }
          }
        }
        return;
      }

      console.debug("[ExamPage] fetching exam from API", examId);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/student/exam/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.debug("[ExamPage] fetched:", res.data);
      setExamName(res.data.examName || "Exam");
      setMcqs(Array.isArray(res.data.questions) ? res.data.questions : []);
      const progress = res.data.studentProgress || {};
      setSubmitted(progress.submitted || false);
      setAttempts(progress.attempts || 0);
      setIsPublished(res.data.assigned !== false);

      if (!progress.submitted) {
        const storedTime = localStorage.getItem(`exam-${examId}-timeLeft`);
        if (storedTime) setTimeLeft(Number(storedTime));
        else if (res.data.duration) setTimeLeft(res.data.duration * 60);

        const savedAnswers = localStorage.getItem(`exam-${examId}-answers`);
        if (savedAnswers) {
          try { setAnswers(JSON.parse(savedAnswers)); } catch (err) { console.warn("[ExamPage] invalid saved answers JSON", err); }
        }
      }

      if ((progress.attempts >= 3) || !res.data.assigned) {
        alert("You cannot start this exam (Max attempts reached or assignment removed). Redirecting to dashboard.");
        navigate("/student-dashboard", { replace: true });
      }
    } catch (err) {
      console.error("[ExamPage] Error fetching MCQs:", err);
      alert("Failed to load exam. Redirecting to dashboard.");
      navigate("/student-dashboard", { replace: true });
    }
  }, [examId, examDataFromState, navigate]);

  useEffect(() => { fetchMCQs(); }, [fetchMCQs]);

  // --- Submit function (stable via useCallback) ---
  const submitExam = useCallback(async (auto = false) => {
    if (submittingRef.current) {
      console.debug("[ExamPage] submit prevented - already in progress");
      return;
    }
    submittingRef.current = true;
    console.debug(`[ExamPage] submitExam called (auto=${auto}) for ${examId}`);

    try {
      // Build a plain object of answers. Prefer mcqs order; fallback to saved keys.
      const built = {};
      const src = latestAnswersRef.current || {};

      if (mcqs && mcqs.length > 0) {
        mcqs.forEach(q => {
          const k = String(q._id);
          built[k] = src[k] !== undefined ? Number(src[k]) : -1;
        });
      } else {
        // if mcqs empty (edge case), use keys from src
        Object.keys(src).forEach(k => { built[String(k)] = Number(src[k]); });
      }

      console.debug("[ExamPage] prepared answers:", built);

      const token = localStorage.getItem("token");
      const body = { answers: built, autoSave: !!auto };

      // Try axios first (normal case). If it fails in page unload cases, try sendBeacon fallback.
      try {
        const res = await axios.post(`${API_URL}/api/student/exam/${examId}/submit`, body, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        console.debug("[ExamPage] submit response", res?.data);
      } catch (postErr) {
        console.warn("[ExamPage] axios post failed; attempting sendBeacon. Err:", postErr);
        try {
          if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            const url = `${API_URL}/api/student/exam/${examId}/submit`;
            const payload = JSON.stringify(body);
            const blob = new Blob([payload], { type: "application/json" });
            const ok = navigator.sendBeacon(url, blob);
            console.debug("[ExamPage] sendBeacon used, success:", ok);
          }
        } catch (beaconErr) {
          console.warn("[ExamPage] sendBeacon also failed:", beaconErr);
        }
      }

      // local cleanup & state
      localStorage.setItem(`exam-${examId}-submitted`, "true");
      localStorage.removeItem(`exam-${examId}-timeLeft`);
      localStorage.removeItem(`exam-${examId}-answers`);
      setSubmitted(true);
      clearInterval(timerRef.current);
      clearInterval(autoSaveRef.current);

      console.info("[ExamPage] submit flow finished (auto=%s)", auto);
    } catch (err) {
      console.error("[ExamPage] Unexpected submit error:", err);
    } finally {
      submittingRef.current = false;
    }
  }, [examId, mcqs]);

  // keep submitRef pointing to the latest submitExam function
  useEffect(() => { submitRef.current = submitExam; }, [submitExam]);

  // manual wrapper (this avoids optional-chaining call syntax errors some linters show)
  // const handleManualSubmit = () => { 
  //   if (submitRef.current) submitRef.current(false); 
  // };

  // --- Timer ---
  useEffect(() => {
    if (!examStarted || submitted || timeLeft === null) return;

    console.debug("[ExamPage] Timer effect starting. timeLeft:", timeLeft);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          console.debug("[ExamPage] Timer finished -> auto-submit");
          if (submitRef.current) submitRef.current(true);
          return 0;
        }
        if (prev <= 120) setWarning(true);
        localStorage.setItem(`exam-${examId}-timeLeft`, prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [examStarted, submitted, timeLeft, examId]);

  // --- Auto-save ---
  useEffect(() => {
    if (!examStarted || submitted) return;

    autoSaveRef.current = setInterval(() => {
      localStorage.setItem(`exam-${examId}-answers`, JSON.stringify(latestAnswersRef.current || {}));
      console.debug("[ExamPage] Auto-saved answers to localStorage");
    }, 60000);

    return () => clearInterval(autoSaveRef.current);
  }, [examStarted, submitted, examId]);

  // --- Fullscreen helper ---
  const goFullScreen = async () => {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      console.debug("[ExamPage] requested fullscreen");
    } catch (err) {
      console.warn("[ExamPage] fullscreen request error:", err);
    }
  };

  // --- Events that indicate cheating / leaving --- 
  useEffect(() => {
    const onFullscreenChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      const isFull = !!fsEl;
      console.debug("[ExamPage] fullscreenchange -> isFull:", isFull);
      if (!isFull && examStarted && !submitted) {
        console.warn("[ExamPage] exited fullscreen -> auto-submitting");
        if (submitRef.current) submitRef.current(true);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        console.debug("[ExamPage] Escape pressed");
        if (examStarted && !submitted) {
          console.warn("[ExamPage] Escape -> auto-submitting");
          if (submitRef.current) submitRef.current(true);
        }
      }
    };

    const onVisibilityChange = () => {
      console.debug("[ExamPage] visibilitychange -> hidden:", document.hidden);
      if (document.hidden && examStarted && !submitted) {
        console.warn("[ExamPage] Tab hidden -> auto-submitting");
        if (submitRef.current) submitRef.current(true);
      }
    };

    const onWindowBlur = () => {
      console.debug("[ExamPage] window blur");
      if (examStarted && !submitted) {
        console.warn("[ExamPage] Window blur -> auto-submitting");
        if (submitRef.current) submitRef.current(true);
      }
    };

    const beforeUnloadHandler = (e) => {
      console.debug("[ExamPage] beforeunload triggered");
      if (examStarted && !submitted) {
        if (submitRef.current) submitRef.current(true);
        // some browsers ignore custom message now
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const pagehideHandler = (e) => {
      console.debug("[ExamPage] pagehide triggered (persisted=%s)", e.persisted);
      if (examStarted && !submitted) {
        if (submitRef.current) submitRef.current(true);
      }
    };

    window.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("webkitfullscreenchange", onFullscreenChange);
    window.addEventListener("mozfullscreenchange", onFullscreenChange);
    window.addEventListener("MSFullscreenChange", onFullscreenChange);

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    window.addEventListener("pagehide", pagehideHandler);

    return () => {
      window.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      window.removeEventListener("mozfullscreenchange", onFullscreenChange);
      window.removeEventListener("MSFullscreenChange", onFullscreenChange);

      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.removeEventListener("pagehide", pagehideHandler);
    };
  }, [examStarted, submitted]);

  // back-button / popstate protection
    useEffect(() => {
      const handlePopState = () => {
        if (!submitted && examStarted) {
          const ok = window.confirm(
            "Exam is in progress. Leaving will submit your exam. Do you want to leave?"
          );
          if (!ok) {
            window.history.pushState(null, "", window.location.href);
          } else {
            if (submitRef.current) submitRef.current(true);
          }
        }
      };

      // attach
      window.addEventListener("popstate", handlePopState);

      // push dummy state (so back button triggers popstate)
      try {
        window.history.pushState(null, "", window.location.href);
      } catch {
        /* ignore */
      }

      // cleanup
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }, [examStarted, submitted]);

  // Start button handler
  const handleStart = async () => {
    console.debug("[ExamPage] Start clicked");
    setExamStarted(true);

    // pull local persisted answers/time
    const savedAnswers = localStorage.getItem(`exam-${examId}-answers`);
    if (savedAnswers) {
      try { setAnswers(JSON.parse(savedAnswers)); } catch { console.warn("[ExamPage] invalid saved answers JSON"); }
    }
    const storedTime = localStorage.getItem(`exam-${examId}-timeLeft`);
    if (storedTime) setTimeLeft(Number(storedTime));

    // request fullscreen (best-effort)
    await goFullScreen();
  };

  // handle option select
  const handleSelect = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => {
      const updated = { ...prev, [questionId]: optionIndex };
      localStorage.setItem(`exam-${examId}-answers`, JSON.stringify(updated));
      return updated;
    });
  };

  const formatTime = seconds => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers || {}).length;

  // if submitted, show message and redirect
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-800">You have already submitted this exam.</h2>
        <p className="text-gray-600 mt-2">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 relative">
      {!examStarted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Exam Instructions</h2>
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
              <li>Do not refresh the page or leave the exam tab.</li>
              <li>Do not use mobile back button or browser back button.</li>
              <li>Answers are auto-saved every 60 seconds.</li>
              <li>The exam will auto-submit when time is over, or when you exit fullscreen, switch tabs, minimize, or press the back button.</li>
            </ul>
            <button
              onClick={handleStart}
              disabled={!isPublished || attempts >= 3}
              className={`w-full py-3 rounded text-white font-semibold ${(!isPublished || attempts >=3) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              I Understand, Start Exam
            </button>
          </div>
        </div>
      )}

      {examStarted && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sticky top-0 bg-gray-100 p-3 z-50 shadow">
            <h1 className="text-2xl font-bold">{examName}</h1>
            {timeLeft !== null && (
              <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <span className={`text-lg font-semibold ${warning ? "text-red-700 animate-pulse" : "text-red-600"}`}>
                  Time Left: {formatTime(timeLeft)}
                </span>
                <span className="text-gray-700 font-medium">Total: {mcqs.length} | Answered: {answeredCount}</span>
              </div>
            )}
          </div>

          {mcqs.length > 0 && (
            <div className="flex overflow-x-auto space-x-2 mb-4 py-1 px-1 sticky top-[72px] bg-gray-100 z-40">
              {mcqs.map((q, idx) => (
                <button
                  key={String(q._id)}
                  onClick={() => document.getElementById(`q-${idx}`)?.scrollIntoView({ behavior: "smooth" })}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border ${answers[String(q._id)] !== undefined ? "bg-green-500 text-white border-green-500" : "bg-gray-200 text-gray-700 border-gray-300"} touch-manipulation`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}

          <div>
            {mcqs.map((q, idx) => (
              <QuestionCard
                key={String(q._id)}
                question={q}
                idx={idx}
                selected={answers[String(q._id)]}
                onSelect={handleSelect}
                id={`q-${idx}`}
              />
            ))}
          </div>

          {mcqs.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => { if (submitRef.current) submitRef.current(false); }}
                disabled={answeredCount === 0}
                className={`w-full sm:w-auto px-4 py-3 rounded text-white text-lg ${answeredCount === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
              >
                Submit Exam
              </button>
            </div>
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
