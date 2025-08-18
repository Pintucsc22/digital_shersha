import React from 'react';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-200 text-center p-6 mt-8 shadow-inner rounded-t-2xl">
    
    <div className="mb-2">
      Connect:
      <a 
        href="https://linkedin.com" 
        className="mx-2 underline text-yellow-300 hover:text-yellow-400 transition-colors duration-300"
      >
        LinkedIn
      </a>
      <a 
        href="https://github.com" 
        className="mx-2 underline text-yellow-300 hover:text-yellow-400 transition-colors duration-300"
      >
        GitHub
      </a>
      <a 
        href="mailto:youremail@gmail.com" 
        className="mx-2 underline text-yellow-300 hover:text-yellow-400 transition-colors duration-300"
      >
        Gmail
      </a>
    </div>

    <div className="text-sm text-gray-400">&copy; 2025 Bengali Digital Exam</div>
  </footer>
);

export default Footer;
