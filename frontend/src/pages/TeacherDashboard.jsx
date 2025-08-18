import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const [formData, setFormData] = useState({
    examName: "",
    className: "",
    topic: "",
    date: "",
    duration: "",
  });

  const [exams, setExams] = useState([]);
  const [editingExam, setEditingExam] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdateExam = async (e) => {
    e.preventDefault();
    try {
      let url = "http://localhost:5000/api/teacher/exams";
      let method = "POST";
      if (editingExam) {
        url += `/${editingExam._id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save exam");
      const savedExam = await res.json();

      if (editingExam) {
        setExams((prev) =>
          prev.map((e) => (e._id === editingExam._id ? savedExam : e))
        );
        setEditingExam(null);
      } else {
        // Add latest exam to the top
        setExams((prev) => [savedExam, ...prev]);
      }

      setFormData({
        examName: "",
        className: "",
        topic: "",
        date: "",
        duration: "",
      });
    } catch (err) {
      console.error("Error saving exam:", err);
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/teacher/exams", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Sort exams: latest first
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setExams(sorted);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleEditClick = (exam) => {
    setEditingExam(exam);
    setFormData({
      examName: exam.examName,
      className: exam.className,
      topic: exam.topic,
      date: new Date(exam.date).toISOString().split("T")[0],
      duration: exam.duration,
    });
  };

  const handleDeleteExam = async (examId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/teacher/exams/${examId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete exam");
      setExams((prev) => prev.filter((e) => e._id !== examId));
    } catch (err) {
      console.error(err);
    }
  };

  const [assigningExamId, setAssigningExamId] = useState(null);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const handleFetchStudent = async () => {
    if (!studentIdInput) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/${studentIdInput}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (!res.ok) throw new Error("Student not found");
      const data = await res.json();
      if (data.role !== "student") throw new Error("Not a student");
      setStudentDetails(data);
    } catch (err) {
      console.error(err);
      setStudentDetails(null);
      alert(err.message || "Student not found");
    }
  };

  const handleAssignStudent = async (examId) => {
    if (!studentDetails) return;
    try {
      setAssignLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/teacherQuestions/exams/${examId}/assign-student`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ studentId: studentDetails.userId }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign");
      alert(`Student ${studentDetails.name} assigned successfully!`);
      setAssigningExamId(null);
      setStudentIdInput("");
      setStudentDetails(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to assign student");
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 min-h-screen">

      {/* Welcome Section */}
      <div className="bg-white/95 shadow-lg rounded-lg p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h2>
          <p className="text-gray-600 text-lg">Your User ID: {user?.userId}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200"
        >
          Logout
        </button>
      </div>

      {/* Exam Form */}
      <div className="bg-white/95 shadow-lg rounded-lg p-6">
        <form onSubmit={handleCreateOrUpdateExam} className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            name="examName"
            placeholder="Exam Name"
            value={formData.examName}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
          />
          <select
            name="className"
            value={formData.className}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
          >
            <option value="">Select Class</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <input
            type="text"
            name="topic"
            placeholder="Exam Topic"
            value={formData.topic}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
          />
          <input
            type="number"
            name="duration"
            placeholder="Time in Minutes"
            value={formData.duration}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200 md:col-span-2"
          >
            {editingExam ? "Update Exam" : "Create Exam"}
          </button>
        </form>
      </div>

      {/* Exams List */}
      <div className="bg-white/95 shadow-lg rounded-lg p-4 max-h-[500px] overflow-y-auto space-y-4">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="exam-card border-b pb-4 hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 rounded-lg p-3"
          >
            <h3 className="font-bold text-lg text-gray-800">
              {exam.examName} - Class {exam.className}
            </h3>
            <p className="text-gray-600">Topic: {exam.topic}</p>
            <p className="text-gray-600">Date: {new Date(exam.date).toLocaleDateString()}</p>
            <p className="text-gray-600">Duration: {exam.duration} minutes</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => handleEditClick(exam)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteExam(exam._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
              >
                Delete
              </button>
              <button
                onClick={() => navigate(`/teacher/exam/${exam._id}/mcqs`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
              >
                Questions
              </button>
              <button
                onClick={() =>
                  setAssigningExamId(assigningExamId === exam._id ? null : exam._id)
                }
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
              >
                {assigningExamId === exam._id ? "Cancel" : "Assign Student"}
              </button>

              {assigningExamId === exam._id && (
                <div className="mt-2 p-4 border rounded-lg bg-gray-50 shadow-lg animate-fadeIn flex flex-col gap-3 transition-all duration-300">
                  <input
                    type="text"
                    placeholder="Enter Student ID"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                  />
                  <button
                    onClick={handleFetchStudent}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md disabled:opacity-50 transition-all duration-200"
                    disabled={!studentIdInput.trim()}
                  >
                    Fetch Student
                  </button>

                  {studentDetails && (
                    <div className="mt-2 p-3 border rounded-lg bg-white shadow-md flex flex-col gap-2">
                      <p className="font-medium text-gray-800">Name: {studentDetails.name}</p>
                      <p className="text-gray-600">
                        Class: {studentDetails.className || studentDetails.class}
                      </p>
                      <button
                        onClick={() => handleAssignStudent(exam._id)}
                        disabled={assignLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
                      >
                        {assignLoading ? "Assigning..." : "Assign Student"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => navigate(`/teacher/exam/${exam._id}/submissions`)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md mt-2 transition-all duration-200"
              >
                View Submissions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
