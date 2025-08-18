import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChatBox = ({ type, onClose }) => {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text:
        type === "login"
          ? "Welcome back! Please enter your email to log in."
          : "Hello! Register as a Teacher or Student?",
    },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  // Auto scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (text, from = "user") => {
    setMessages((prev) => [...prev, { from, text }]);
  };

  const handleUserInput = async (e) => {
    e.preventDefault();
    if (!input.trim() && !(type === "register" && step === 4 && role === "Student"))
      return;

    const reply = input.trim();
    if (!(type === "register" && step === 4 && role === "Student")) addMessage(reply);
    setInput("");

    if (type === "register") {
      switch (step) {
        case 0: {
          // Role selection
          const roleInput = reply.toLowerCase();
          if (roleInput === "teacher" || roleInput === "student") {
            const formattedRole =
              roleInput.charAt(0).toUpperCase() + roleInput.slice(1);
            setRole(formattedRole);
            addMessage(
              `Great! Let's begin your ${formattedRole} registration. Please enter your full name`,
              "bot"
            );
            setStep(1);
          } else {
            addMessage("Please type 'Teacher' or 'Student'.", "bot");
          }
          break;
        }

        case 1: {
          // Name
          if (reply.length < 5) addMessage("Name must be at least 5 characters.", "bot");
          else {
            setFormData((prev) => ({ ...prev, name: reply }));
            addMessage("Enter your email address:", "bot");
            setStep(2);
          }
          break;
        }

        case 2: {
          // Email
          if (!reply.includes("@") || !reply.includes(".")) {
            addMessage("Please enter a valid email address.", "bot");
          } else {
            setFormData((prev) => ({ ...prev, email: reply }));
            try {
              setLoading(true);
              const res = await fetch("http://localhost:5000/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: reply }),
              });
              const data = await res.json();
              if (res.ok) {
                addMessage("OTP sent to your email. Enter the OTP:", "bot");
                setStep(3);
              } else addMessage(data.message || "Failed to send OTP.", "bot");
            } catch (err) {
              console.log(err);
              addMessage("Network error while sending OTP.", "bot");
            } finally {
              setLoading(false);
            }
          }
          break;
        }

        case 3: {
          // OTP
          try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: formData.email, otp: reply }),
            });
            const data = await res.json();
            if (res.ok) {
              addMessage("OTP verified successfully.", "bot");
              if (role === "Student") {
                addMessage("Select your class (1-12):", "bot");
                setStep(4);
              } else {
                addMessage("Enter your desired password:", "bot");
                setStep(5);
              }
            } else addMessage(data.message || "Invalid OTP", "bot");
          } catch (err) {
            console.log(err);
            addMessage("Network error during OTP verification", "bot");
          } finally {
            setLoading(false);
          }
          break;
        }

        case 4: {
          // Class (for students)
          const classNum = parseInt(reply || "", 10);
          if (!classNum || classNum < 1 || classNum > 12) {
            addMessage("Please select a valid class between 1 and 12.", "bot");
          } else {
            setFormData((prev) => ({ ...prev, className: classNum }));
            addMessage("Now enter your desired password:", "bot");
            setStep(5);
          }
          break;
        }

        case 5: {
          // Password
          if (reply.length < 4) addMessage("Password must be at least 4 characters.", "bot");
          else {
            const finalData = { ...formData, password: reply, role };
            try {
              setLoading(true);
              const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalData),
              });
              const data = await res.json();
              if (res.ok) {
                addMessage("Registration successful! Check your email.", "bot");
                onClose();
              } else addMessage(data.message || "Registration failed", "bot");
            } catch (err) {
              console.log(err);
              addMessage("Error during registration.", "bot");
            } finally {
              setLoading(false);
            }
          }
          break;
        }

        default:
          break;
      }
    } else if (type === "login") {
      switch (step) {
        case 0: {
          if (!reply.includes("@") || !reply.includes(".")) {
            addMessage("Please enter a valid email address.", "bot");
          } else {
            setFormData((prev) => ({ ...prev, email: reply }));
            addMessage("Enter your password:", "bot");
            setStep(1);
          }
          break;
        }
        case 1: {
          if (reply.length < 4) addMessage("Password must be at least 4 characters.", "bot");
          else {
            try {
              setLoading(true);
              const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, password: reply }),
              });
              const data = await res.json();
              if (res.ok) {
                addMessage("Login successful!", "bot");
                localStorage.setItem("token", data.token);
                localStorage.setItem(
                  "user",
                  JSON.stringify({
                    userId: data.userId,
                    name: data.name,
                    role: data.role,
                    className: data.className || null,
                  })
                );
                const role = (data.role || "").toLowerCase();
                if (role === "teacher") navigate("/teacher-dashboard");
                else if (role === "student") navigate("/student-dashboard");
                else addMessage("Unknown user role.", "bot");
                onClose();
              } else addMessage(data.message || "Login failed. Try again.", "bot");
            } catch (err) {
              console.error(err);
              addMessage("Network error during login.", "bot");
            } finally {
              setLoading(false);
            }
          }
          break;
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-end justify-center z-50 md:items-end md:justify-end p-2 md:p-6">
      <div className="w-full max-w-[360px] h-[70vh] md:w-[360px] md:h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-105">
        {/* Header */}
        <div
          className={`${
            type === "login"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600"
              : "bg-gradient-to-r from-indigo-900 via-purple-700 to-pink-600"
          } text-white p-4 flex justify-between items-center rounded-t-2xl shadow-md`}
        >
          <span className="font-bold text-lg animate-pulse">
            {type === "login" ? "Chat Login" : "Chat Registration"}
          </span>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200 text-xl font-bold"
          >
            ✖
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
          ref={chatContainerRef}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`text-sm px-3 py-2 rounded-lg max-w-[80%] break-words ${
                msg.from === "bot"
                  ? "bg-gray-200 text-gray-900 text-left animate-fadeIn"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white ml-auto text-right shadow-md animate-fadeIn"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleUserInput}
          className="p-3 flex gap-2 border-t border-gray-200 bg-white"
        >
          {type === "register" && step === 4 && role === "Student" ? (
            <input
              type="number"
              min={1}
              max={12}
              value={formData.className || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, className: e.target.value }))
              }
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
              placeholder="Select class (1-12)"
              disabled={loading}
            />
          ) : (
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
              placeholder="Type here ..."
              disabled={loading}
            />
          )}

          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-indigo-600 hover:to-blue-600 transition-all duration-200 shadow-md transform hover:scale-105 disabled:opacity-50"
            disabled={loading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
