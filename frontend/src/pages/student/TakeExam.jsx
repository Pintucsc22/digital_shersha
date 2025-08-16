// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// const TakeExam = () => {
//   const { examId } = useParams();
//   const navigate = useNavigate();
//   const [exam, setExam] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchExam = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch(`http://localhost:5000/api/exams/${examId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!res.ok) throw new Error('Failed to fetch exam');
//         const data = await res.json();
//         setExam(data);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching exam:', err);
//         setLoading(false);
//       }
//     };

//     fetchExam();
//   }, [examId]);

//   if (loading) return <p>Loading exam...</p>;
//   if (!exam) return <p>Exam not found.</p>;

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">{exam.title}</h2>
//       <p>{exam.description}</p>
//       {/* Questions will go here next */}
//     </div>
//   );
// };

// export default TakeExam;
