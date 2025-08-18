import React, { useState } from 'react';
import ChatBox from './ChatBox'; // Reusable ChatBox
import logo from '../assets/logo.png';

const Header = () => {
  const [popupType, setPopupType] = useState(null); // 'login', 'register', or null

  return (
    <header className="flex flex-col md:flex-row justify-between items-center text-white px-6 py-6 gap-4 md:gap-0 
                       shadow-lg rounded-b-3xl transform transition-all duration-500 hover:shadow-2xl">

      {/* Logo Image */}
      <img
        src={logo}
        alt="Platform Logo"
        title="Home"
        className="rounded-full w-20 h-20 hover:cursor-pointer hover:scale-125 hover:rotate-3 transition-transform duration-500 shadow-2xl border-4 border-yellow-400 animate-pulse"
      />

      {/* Motivational Heading */}
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold italic text-center md:text-left text-yellow-300 drop-shadow-lg max-w-md animate-[bounce_2s_infinite]">
        Your future is being built now—not by sitting idle
      </h1>

      {/* Login & Register Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => setPopupType('login')}
          className="border border-yellow-400 text-yellow-300 font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300 shadow-lg hover:scale-105"
        >
          Login
        </button>
        <button
          onClick={() => setPopupType('register')}
          className="border border-yellow-400 text-yellow-300 font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300 shadow-lg hover:scale-105"
        >
          Register
        </button>
      </div>

      {/* ChatBox Popup */}
      {popupType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <ChatBox type={popupType} onClose={() => setPopupType(null)} />
        </div>
      )}
    </header>
  );
};

export default Header;
