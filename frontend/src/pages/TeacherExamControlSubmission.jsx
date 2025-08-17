import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const TeacherExamControlSubmission = () => {
  const { id: examId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch submissions for this exam
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/teacher/exams/${examId}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to load submissions");
      const data = await res.json();
      // Sort: submitted first
      data.sort((a, b) => (b.submittedAt ? 1 : 0) - (a.submittedAt ? 1 : 0));
      setSubmissions(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch submissions.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle publish flag
  const handlePublishToggle = async (submissionId, current) => {
    const confirmMsg = current
      ? "Are you sure you want to unpublish this result?"
      : "Are you sure you want to publish this result?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/teacher/exams/submissions/${submissionId}/publish`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ publish: !current }),
        }
      );
      if (!res.ok) throw new Error("Failed to update publish status");

      // Update local state instead of refetching all
      setSubmissions(prev =>
        prev.map(s =>
          s._id === submissionId ? { ...s, resultPublished: !current } : s
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [examId]);

  if (loading)
    return (
      <div className="p-4">
        <p className="text-gray-600">Loading submissions...</p>
      </div>
    );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Exam Submissions</h2>

      {submissions.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Student Name</th>
                <th className="border p-2 text-left">Submitted At</th>
                <th className="border p-2 text-left">Score</th>
                <th className="border p-2 text-left">Result Published</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s._id} className={s.submittedAt ? "" : "bg-gray-50"}>
                  <td className="border p-2">{s.student?.name || "Unknown"}</td>
                  <td className="border p-2">
                    {s.submittedAt
                      ? new Date(s.submittedAt).toLocaleString()
                      : "Not Submitted"}
                  </td>
                  <td className="border p-2">{s.submittedAt ? s.score : "-"}</td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        s.resultPublished ? "bg-green-500" : "bg-gray-400"
                      }`}
                    >
                      {s.resultPublished ? "Published" : "Pending"}
                    </span>
                  </td>
                  <td className="border p-2">
                    {s.submittedAt && (
                      <button
                        onClick={() =>
                          handlePublishToggle(s._id, s.resultPublished)
                        }
                        className={`px-3 py-1 rounded text-white text-sm ${
                          s.resultPublished
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {s.resultPublished ? "Unpublish" : "Publish"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherExamControlSubmission;
