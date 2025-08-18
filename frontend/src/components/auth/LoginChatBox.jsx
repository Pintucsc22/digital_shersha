// // LoginChatBox.jsx

// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const LoginChatBox = ({ onClose }) => {
//   const [messages, setMessages] = useState([
//     { from: "bot", text: "Welcome back! Please enter your email to log in." },
//   ]);
//   const [step, setStep] = useState(0);
//   const [formData, setFormData] = useState({});
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const chatContainerRef = useRef(null);
//   const navigate = useNavigate();

//   // Auto scroll
//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const addMessage = (text, from = "user") => {
//     setMessages((prev) => [...prev, { from, text }]);
//   };

//   const handleUserInput = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const reply = input.trim();
//     addMessage(reply);
//     setInput("");

//     switch (step) {
//       case 0: {
//         // Email step
//         const email = reply || "";
//         if (!email.includes("@") || !email.includes(".")) {
//           addMessage("Please enter a valid email address.", "bot");
//         } else {
//           setFormData((prev) => ({ ...prev, email }));
//           addMessage("Enter your password:", "bot");
//           setStep(1);
//         }
//         break;
//       }

//       case 1: {
//         // Password step
//         const password = reply || "";
//         if (password.length < 4) {
//           addMessage("Password must be at least 4 characters.", "bot");
//           return;
//         }

//         try {
//           setLoading(true);
//           const res = await fetch("http://localhost:5000/api/auth/login", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ ...formData, password }),
//           });

//           const data = await res.json();
//           console.log("Login response:", data);

//           if (res.ok) {
//             addMessage("Login successful!", "bot");

//             // Save token & user info
//             localStorage.setItem("token", data.token);
//             localStorage.setItem(
//               "user",
//               JSON.stringify({
//                 userId: data.userId,
//                 name: data.name,
//                 role: data.role,
//                 className: data.className || null,
//               })
//             );

//             // Redirect
//             const role = (data.role || "").toLowerCase();
//             if (role === "teacher") navigate("/teacher-dashboard");
//             else if (role === "student") navigate("/student-dashboard");
//             else addMessage("Unknown user role.", "bot");

//             onClose();
//           } else {
//             addMessage(data.message || "Login failed. Try again.", "bot");
//           }
//         } catch (err) {
//           console.error(err);
//           addMessage("Network error during login.", "bot");
//         } finally {
//           setLoading(false);
//         }
//         break;
//       }

//       default:
//         break;
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex items-end justify-center z-50 md:items-end md:justify-end p-2 md:p-6">
//       <div className="w-full max-w-[360px] h-[70vh] md:w-[360px] md:h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-105">
        
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center rounded-t-2xl shadow-md">
//           <span className="font-bold text-lg animate-pulse">Chat Login</span>
//           <button
//             onClick={onClose}
//             className="text-white hover:text-gray-200 transition-colors duration-200 text-xl font-bold"
//           >
//             ✖
//           </button>
//         </div>

//         {/* Chat Messages */}
//         <div
//           className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
//           ref={chatContainerRef}
//         >
//           {messages.map((msg, i) => (
//             <div
//               key={i}
//               className={`text-sm px-3 py-2 rounded-lg max-w-[80%] break-words ${
//                 msg.from === "bot"
//                   ? "bg-gray-200 text-gray-900 text-left animate-fadeIn"
//                   : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white ml-auto text-right shadow-md animate-fadeIn"
//               }`}
//             >
//               {msg.text}
//             </div>
//           ))}
//         </div>

//         {/* Input Area */}
//         <form onSubmit={handleUserInput} className="p-3 flex gap-2 border-t border-gray-200 bg-white">
//           <input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
//             placeholder="Type here ..."
//             disabled={loading}
//           />
//           <button
//             type="submit"
//             className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-indigo-600 hover:to-blue-600 transition-all duration-200 shadow-md transform hover:scale-105 disabled:opacity-50"
//             disabled={loading}
//           >
//             Send
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LoginChatBox;
