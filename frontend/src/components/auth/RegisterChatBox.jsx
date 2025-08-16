// ChatAuthBox.js

import React, { useEffect, useRef, useState } from 'react';

const ChatAuthBox = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Welcome! Register as a Teacher or Student?" }
  ]);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

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

    // For step 4 (number input) we use formData.className directly
    if (step !== 4 && !input.trim()) return;

    const reply = input.trim();
    if (step !== 4) addMessage(reply);
    setInput("");

    switch (step) {
      case 0: { // Role
        const roleInput = reply.toLowerCase();
        if (["teacher", "student"].includes(roleInput)) {
          const formattedRole = roleInput.charAt(0).toUpperCase() + roleInput.slice(1);
          setRole(formattedRole);
          addMessage(`Great! Let's begin your ${formattedRole} registration. Please write your full name`, "bot");
          setStep(1);
        } else {
          addMessage("Please type 'Teacher' or 'Student'.", "bot");
        }
        break;
      }

      case 1: { // Name
        if (reply.length < 5) {
          addMessage("Name must be at least 5 characters.", "bot");
        } else {
          setFormData(prev => ({ ...prev, name: reply }));
          addMessage("Enter your email address:", "bot");
          setStep(2);
        }
        break;
      }

      case 2: { // Email
        if (!reply.includes("@") || !reply.includes(".")) {
          addMessage("Please enter a valid email address.", "bot");
        } else {
          setFormData(prev => ({ ...prev, email: reply }));
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
            } else {
              addMessage(data.message || "Failed to send OTP.", "bot");
            }
          } catch (err) {
            console.log(err);
            addMessage("Network error while sending OTP.", "bot");
          } finally {
            setLoading(false);
          }
        }
        break;
      }

      case 3: { // OTP
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
          } else {
            addMessage(data.message || "Invalid OTP", "bot");
          }
        } catch (err) {
          console.log(err);
          addMessage("Network error during OTP verification", "bot");
        } finally {
          setLoading(false);
        }
        break;
      }

      case 4: { // Class Name (number input 1-12)
        const classNum = parseInt(formData.className, 10);
        if (!classNum || classNum < 1 || classNum > 12) {
          addMessage("Please select a valid class between 1 and 12.", "bot");
        } else {
          addMessage("Now enter your desired password:", "bot");
          setStep(5);
        }
        break;
      }

      case 5: { // Password
        if (reply.length < 4) {
          addMessage("Password must be at least 4 characters.", "bot");
        } else {
          const finalData = {
            ...formData,
            password: reply,
            role,
          };
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
            } else {
              addMessage(data.message || "Registration failed", "bot");
            }
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
  };

  return (
    <div className="fixed bottom-4 right-4 w-[350px] h-[500px] bg-white border rounded-xl shadow-lg flex flex-col z-50">
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-xl">
        <span className="font-bold">Chat Registration</span>
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
        {step === 4 && role === "Student" ? (
          <input
            type="number"
            min={1}
            max={12}
            value={formData.className || ""}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, className: e.target.value }))
            }
            className="flex-1 border rounded-lg px-3 py-1 text-sm"
            placeholder="Select class (1-12)"
            disabled={loading}
          />
        ) : (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-1 text-sm"
            placeholder="Type here ..."
            disabled={loading}
          />
        )}

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

export default ChatAuthBox;
