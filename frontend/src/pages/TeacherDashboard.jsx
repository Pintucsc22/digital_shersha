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
        setExams((prev) => [...prev, savedExam]);
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
      .then((data) => setExams(data))
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
    <div>
      <div>
        <h2>Welcome, {user?.name}</h2>
        <p>Your User ID: {user?.userId}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Exam Form */}
      <div>
        <form onSubmit={handleCreateOrUpdateExam}>
          <input
            type="text"
            name="examName"
            placeholder="Exam Name"
            value={formData.examName}
            onChange={handleChange}
            required
          />
          <select
            name="className"
            value={formData.className}
            onChange={handleChange}
            required
          >
            <option value="">Select Class</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="topic"
            placeholder="Exam Topic"
            value={formData.topic}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="duration"
            placeholder="Time in Minutes"
            value={formData.duration}
            onChange={handleChange}
            required
          />
          <button type="submit">{editingExam ? "Update Exam" : "Create Exam"}</button>
        </form>
      </div>

      {/* Exams List */}
      <div className="max-h-80 overflow-y-auto border-gray-300 p-4 rounded-lg">
        {exams.map((exam) => (
          <div key={exam._id} className="exam-card border-b mb-2 pb-2">
            <h3>
              {exam.examName} - Class {exam.className}
            </h3>
            <p>Topic: {exam.topic}</p>
            <p>Date: {new Date(exam.date).toLocaleDateString()}</p>
            <p>Duration: {exam.duration} minutes</p>
            <button onClick={() => handleEditClick(exam)}>Edit</button>
            <button onClick={() => handleDeleteExam(exam._id)}>Delete</button>
            <button
              onClick={() => navigate(`/teacher/exam/${exam._id}/mcqs`)}
              className="btn btn-primary"
            >
              Questions
            </button>

            <button
              onClick={() =>
                setAssigningExamId(assigningExamId === exam._id ? null : exam._id)
              }
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              {assigningExamId === exam._id ? "Cancel" : "Assign Student"}
            </button>

            {assigningExamId === exam._id && (
              <div className="mt-2 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Enter Student ID"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <button
                  onClick={handleFetchStudent}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  disabled={!studentIdInput.trim()}
                >
                  Fetch Student
                </button>

                {studentDetails && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <p>Name: {studentDetails.name}</p>
                    <p>Class: {studentDetails.className || studentDetails.class}</p>
                    <button
                      onClick={() => handleAssignStudent(exam._id)}
                      disabled={assignLoading}
                      className="bg-green-500 text-white px-3 py-1 rounded mt-2"
                    >
                      {assignLoading ? "Assigning..." : "Assign Student"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
