import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const McqQuestionManager = ({ examId: propExamId }) => {
  const params = useParams();
  const examId = propExamId || params.examId; // Use prop if passed, else fallback to URL param
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (examId) {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, token]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/teacher/questions/exam/${examId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch questions');

      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error('Failed to fetch questions', err);
      alert('Error fetching questions');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const resetForm = () => {
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(null);
    setEditingQuestionId(null);
  };

  const handleAddOrUpdateQuestion = async () => {
    if (!questionText || options.some((opt) => !opt) || correctAnswer === null) {
      alert('All fields are required.');
      return;
    }

    const payload = {
      questionText,
      options,
      correctAnswer,
      // examId is not sent in body since it's in URL
    };

    try {
      const res = await fetch(
        editingQuestionId
          ? `http://localhost:5000/api/teacher/questions/${editingQuestionId}`
          : `http://localhost:5000/api/teacher/questions/${examId}`,
        {
          method: editingQuestionId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await res.json();

      if (res.ok) {
        if (editingQuestionId) {
          setQuestions((prev) => prev.map((q) => (q._id === editingQuestionId ? data : q)));
        } else {
          setQuestions((prev) => [...prev, data]);
        }
        resetForm();
      } else {
        alert(data.message || 'Failed to save question');
      }
    } catch (err) {
      console.error('Error saving question', err);
      alert('Error saving question');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestionId(question._id);
    setQuestionText(question.questionText);
    setOptions(question.options);
    setCorrectAnswer(question.correctAnswer);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/teacher/questions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q._id !== id));
      } else {
        alert('Failed to delete question');
      }
    } catch (err) {
      console.error('Error deleting question', err);
      alert('Error deleting question');
    }
  };

  if (!examId) {
    return (
      <div className="mt-4 text-red-600 font-semibold">
        No exam selected. Please go back and select an exam.
      </div>
    );
  }

  return (
    <div className="mt-4 bg-gray-50 border p-4 rounded">
      <button onClick={() => navigate('/teacher')} className="mb-4 text-blue-600 hover:underline">
        ← Back to Dashboard
      </button>

      <h4 className="text-lg font-semibold mb-3">
        {editingQuestionId ? 'Edit Question' : 'Add New Question'}
      </h4>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Question text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
        />

        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center mb-1">
            <input
              type="radio"
              name="correct"
              checked={correctAnswer === idx}
              onChange={() => setCorrectAnswer(idx)}
              className="mr-2"
            />
            <input
              type="text"
              placeholder={`Option ${String.fromCharCode(65 + idx)}:`}
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        ))}

        <div className="mt-3 space-x-2">
          <button onClick={handleAddOrUpdateQuestion} className="bg-green-600 text-white px-4 py-2 rounded">
            {editingQuestionId ? 'Update Question' : 'Add Question'}
          </button>
          {editingQuestionId && (
            <button onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div>
        <h5 className="font-semibold mb-2">Existing Questions:</h5>
        {questions.length === 0 ? (
          <p className="text-sm text-gray-600">No questions added yet.</p>
        ) : (
          <ul className="space-y-2">
            {questions.map((q, index) => (
              <li key={q._id} className="bg-white p-3 border rounded shadow-sm">
                <p className="font-medium">
                  {index + 1}. {q.questionText}
                </p>
                <ul className="list-disc ml-6 text-sm text-gray-700">
                  {q.options.map((opt, idx) => (
                    <li key={idx} className={idx === q.correctAnswer ? 'font-semibold text-green-700' : ''}>
                      {String.fromCharCode(65 + idx)}. {opt}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 space-x-2">
                  <button onClick={() => handleEdit(q)} className="text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(q._id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default McqQuestionManager;
