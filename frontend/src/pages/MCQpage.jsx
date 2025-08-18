// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";

// const MCQPage = () => {
//   const { id } = useParams(); // exam ID
//   const [mcqs, setMcqs] = useState([]);
//   const navigate = useNavigate();

//   const [newMCQ, setNewMCQ] = useState({
//     question: "",
//     options: ["", "", "", ""],
//     correctOption: "A",
//   });

//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editData, setEditData] = useState({
//     question: "",
//     options: ["", "", "", ""],
//     correctOption: "A",
//   });

//   const fetchMCQs = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get(
//         `http://localhost:5000/api/mcq/${id}/mcqs`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setMcqs(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error(err);
//       setMcqs([]);
//     }
//   };

//   useEffect(() => {
//     fetchMCQs();
//   }, [id]);

//   const handleAddMCQ = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.post(
//         `http://localhost:5000/api/mcq/${id}/mcqs`,
//         newMCQ,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setMcqs([...mcqs, res.data]);
//       setNewMCQ({ question: "", options: ["", "", "", ""], correctOption: "A" });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleUpdateMCQ = async (index) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.put(
//         `http://localhost:5000/api/mcq/${id}/mcq/${index}`,
//         editData,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const updated = [...mcqs];
//       updated[index] = res.data;
//       setMcqs(updated);
//       setEditingIndex(null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleDeleteMCQ = async (index) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(
//         `http://localhost:5000/api/mcq/${id}/mcq/${index}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const updated = [...mcqs];
//       updated.splice(index, 1);
//       setMcqs(updated);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const indexToLetter = (idx) => ["A", "B", "C", "D"][idx];

//   return (
//     <div>
//       <h2>MCQs for Exam {id}</h2>
//       <button onClick={() => navigate("/teacher-dashboard")}>Back to Dashboard</button>

//       {/* Add new MCQ */}
//       <div>
//         <h3>Add New MCQ</h3>
//         <input
//           placeholder="Question"
//           value={newMCQ.question}
//           onChange={(e) => setNewMCQ({ ...newMCQ, question: e.target.value })}
//         />
//         {newMCQ.options.map((opt, i) => (
//           <div key={i}>
//             <label>{indexToLetter(i)}</label>
//             <input
//               placeholder={`Option ${indexToLetter(i)}`}
//               value={newMCQ.options[i]}
//               onChange={(e) => {
//                 const newOptions = [...newMCQ.options];
//                 newOptions[i] = e.target.value;
//                 setNewMCQ({ ...newMCQ, options: newOptions });
//               }}
//             />
//           </div>
//         ))}
//         <select
//           value={newMCQ.correctOption}
//           onChange={(e) =>
//             setNewMCQ({ ...newMCQ, correctOption: e.target.value })
//           }
//         >
//           {["A", "B", "C", "D"].map((letter) => (
//             <option value={letter} key={letter}>{letter}</option>
//           ))}
//         </select>
//         <button onClick={handleAddMCQ}>Add MCQ</button>
//       </div>

//       {/* Display MCQs */}
//       <ul>
//         {mcqs.map((m, index) => (
//           <li key={index}>
//             {editingIndex === index ? (
//               <>
//                 <input
//                   value={editData.question}
//                   onChange={(e) => setEditData({ ...editData, question: e.target.value })}
//                 />
//                 {editData.options.map((opt, i) => (
//                   <input
//                     key={i}
//                     value={opt}
//                     onChange={(e) => {
//                       const newOpts = [...editData.options];
//                       newOpts[i] = e.target.value;
//                       setEditData({ ...editData, options: newOpts });
//                     }}
//                   />
//                 ))}
//                 <select
//                   value={editData.correctOption}
//                   onChange={(e) =>
//                     setEditData({ ...editData, correctOption: e.target.value })
//                   }
//                 >
//                   {["A", "B", "C", "D"].map((letter) => (
//                     <option key={letter} value={letter}>{letter}</option>
//                   ))}
//                 </select>
//                 <button onClick={() => handleUpdateMCQ(index)}>Save</button>
//                 <button onClick={() => setEditingIndex(null)}>Cancel</button>
//               </>
//             ) : (
//               <>
//                 <b>{m.question}</b>
//                 <ul>
//                   {m.options.map((opt, i) => (
//                     <li key={i}>
//                       {indexToLetter(i)}. {opt}{" "}
//                       {i === m.correctAnswer ? "(Correct)" : ""}
//                     </li>
//                   ))}
//                 </ul>
//                 <button onClick={() => {
//                   setEditingIndex(index);
//                   setEditData({
//                     question: m.question,
//                     options: [...m.options],
//                     correctOption: indexToLetter(m.correctAnswer),
//                   });
//                 }}>Edit</button>
//                 <button onClick={() => handleDeleteMCQ(index)}>Delete</button>
//               </>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default MCQPage;
