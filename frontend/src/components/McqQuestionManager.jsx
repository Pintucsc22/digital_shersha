import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const McqQuestionManager = ({ examId: propExamId }) => {
  const API_URL= import.meta.env.VITE_API_URL || "http://localhost:5000";
  const params = useParams();
  const examId = propExamId || params.examId;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOption: "",
  });

  const API_BASE = `${API_URL}/api/mcq`;
  const optionLetters = ["A", "B", "C", "D"];

  useEffect(() => {
    if (!examId) return;

    axios
      .get(`${API_BASE}/${examId}/mcqs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Fetched Questions:", res.data);
        setQuestions(res.data);
      })
      .catch((err) => console.error("Error fetching questions:", err));
  }, [examId, token]);

  const handleAddQuestion = () => {
    axios
      .post(
        `${API_BASE}/${examId}/mcqs`,
        newQuestion,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setQuestions((prev) => [...prev, res.data]);
        setNewQuestion({
          question: "",
          options: ["", "", "", ""],
          correctOption: "",
        });
      })
      .catch((err) => console.error("Error adding question:", err));
  };

  const handleDeleteQuestion = (index) => {
    axios
      .delete(`${API_BASE}/${examId}/${index}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
      })
      .catch((err) => console.error("Error deleting question:", err));
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      {/* Back Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => navigate("/teacher-dashboard")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          ⬅ Back to Dashboard
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Manage MCQs</h2>

      {/* Add New Question */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Enter question"
          className="border p-2 w-full mb-2 rounded"
          value={newQuestion.question}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, question: e.target.value })
          }
        />

        {newQuestion.options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Option ${i + 1}`}
            className="border p-2 w-full mb-2 rounded"
            value={opt}
            onChange={(e) => {
              const updatedOptions = [...newQuestion.options];
              updatedOptions[i] = e.target.value;
              setNewQuestion({ ...newQuestion, options: updatedOptions });
            }}
          />
        ))}

        <select
          className="border p-2 w-full mb-2 rounded"
          value={newQuestion.correctOption}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, correctOption: e.target.value })
          }
        >
          <option value="">Select Correct Option</option>
          {optionLetters.map((letter) => (
            <option key={letter} value={letter}>
              {letter}
            </option>
          ))}
        </select>

        <button
          onClick={handleAddQuestion}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Question
        </button>
      </div>

      {/* Existing Questions */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Existing Questions</h3>
        {questions.length === 0 ? (
          <p>No questions yet.</p>
        ) : (
          <ul className="space-y-4">
            {questions.map((q, idx) => (
              <li
                key={idx}
                className="border p-3 rounded flex justify-between items-start"
              >
                <div>
                  <p className="font-bold">
                    {idx + 1}. {q.question}
                  </p>
                  <ul className="list-disc ml-6">
                    {q.options.map((opt, i) => (
                      <li key={i}>
                        {optionLetters[i]}. {opt}
                      </li>
                    ))}
                  </ul>
                  <p className="text-green-600">
                    Correct Answer: {optionLetters[q.correctAnswer]}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(idx)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default McqQuestionManager;
