// Import React and useState hook from React
import React, { useState } from 'react';

// Import the AuthPopup component that will show login/register forms
import AuthPopupWrapper from './auth/AuthPopupWrapper';

// Import the logo image from the assets folder
import logo from '../assets/logo.png';

// Define the Header component
const Header = () => {
  // Declare a state variable called 'popupType'
  // It will be either 'login', 'register', or null
  // This is used to control when to show the AuthPopup component
  const [popupType, setPopupType] = useState(null); 

  // Return JSX content to render the UI
  return (
    // Header container with Flexbox and padding
    <header className="flex justify-between items-center bg-white text-black px-6 py-4">
      
      {/* Logo Image */}
      <img 
        src={logo} // Use the imported logo image as the source
        alt="Logo" // Alternative text for screen readers
        className='rounded-full w-20 h-20 ml-[10px] hover:cursor-pointer hover:scale-150' 
        // 'rounded-full' → make the image circular
        // 'w-20 h-20' → width and height = 5rem
        // 'ml-[10px]' → left margin of 10px
        // 'hover:cursor-pointer' → show pointer cursor on hover
        // 'hover:scale-150' → zoom image to 150% on hover
      />

      {/* Motivational Heading */}
      <h1 className="text-3xl font-bold italic">
        Your future is being built now—not by sitting idle
        {/* 'text-3xl' → large font size */}
        {/* 'font-bold' → bold text */}
        {/* 'italic' → italic font style */}
      </h1>

      {/* Login & Register Buttons */}
      <div className="space-x-4">
        {/* 'space-x-4' → horizontal space of 1rem between child elements */}

        {/* Login Button */}
        <button 
          onClick={() => setPopupType('login')} 
          // On click, set popupType to 'login' to open login popup
          className="border border-blue-700 text-blue-600 font-semibold px-3 py-1 rounded hover:bg-blue-500 hover:text-white"
          // 'border border-blue-700' → blue border
          // 'text-blue-600' → blue text color
          // 'font-semibold' → medium bold text
          // 'px-3 py-1' → horizontal padding 0.75rem, vertical padding 0.25rem
          // 'rounded' → rounded corners
          // 'hover:bg-blue-500 hover:text-white' → changes background and text color on hover
        >
          Login
        </button>

        {/* Register Button */}
        <button 
          onClick={() => setPopupType('register')} 
          // On click, set popupType to 'register' to open register popup
          className="border border-blue-700 text-blue-600 font-semibold px-3 py-1 rounded hover:bg-blue-500 hover:text-white"
          // Same styling as login button
        >
          Register
        </button>
      </div>

      {/* Conditionally render AuthPopup only when popupType is not null */}
      {popupType && (
        <AuthPopupWrapper
          type={popupType}
          onClose={() => setPopupType(null)}
        />
      )}
    </header>
  );
};

// Export the Header component so it can be used in other parts of the app
export default Header;
