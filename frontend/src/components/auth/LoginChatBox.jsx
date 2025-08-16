import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Welcome back! Please enter your email to log in." }
  ]);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (text, from = "user") => {
    setMessages(prev => [...prev, { from, text }]);
  };

  const handleUserInput = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const reply = input.trim();
    addMessage(reply);
    setInput("");

    switch (step) {
      case 0: { // Email step
        if (!reply.includes("@") || !reply.includes(".")) {
          addMessage("Please enter a valid email address.", "bot");
        } else {
          setFormData(prev => ({ ...prev, email: reply }));
          addMessage("Enter your password:", "bot");
          setStep(1);
        }
        break;
      }

      case 1: { // Password step
        try {
          setLoading(true);
          const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, password: reply }),
          });

          const data = await res.json();
          console.log("Login response:", data);

          if (res.ok) {
            addMessage("Login successful!", "bot");

            // ✅ Store token and user info
            localStorage.setItem("token", data.token); // <-- Save the JWT token
            // Save the token
            localStorage.setItem("token", data.token);

            // Save the user info
            localStorage.setItem("user", JSON.stringify({
              userId: data.userId,
              name: data.name,
              role: data.role,
              className: data.className ||null
            }));


            // ✅ Redirect based on role
            const role = data.role?.toLowerCase();
            if (role === "teacher") {
              navigate("/teacher-dashboard");
            } else if (role === "student") {
              navigate("/student-dashboard");
            } else {
              addMessage("Unknown user role.", "bot");
            }

            onClose(); // Close the chatbox
          } else {
            addMessage(data.message || "Login failed. Try again.", "bot");
          }
        } catch (err) {
          console.error(err);
          addMessage("Network error during login.", "bot");
        } finally {
          setLoading(false);
        }
        break;
      }

      default:
        break;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-[350px] h-[500px] bg-white border rounded-xl shadow-lg flex flex-col z-50">
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-xl">
        <span className="font-bold">Chat Login</span>
        <button onClick={onClose}>✖</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3" ref={chatContainerRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm p-2 rounded-lg max-w-[85%] my-1
              ${msg.from === "bot"
                ? "bg-gray-200 text-left"
                : "bg-blue-500 text-white ml-auto text-right"
              }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleUserInput} className="p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-1 text-sm"
          placeholder="Type here ..."
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default LoginChatBox;
