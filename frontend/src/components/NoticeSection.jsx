import React from 'react';

const NoticeSection = () => (
  <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-l-8 border-yellow-500 p-5 my-6 rounded-xl shadow-md flex items-center justify-between
                  transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
    
    <div>
      <h2 className="font-bold text-xl md:text-2xl text-yellow-300 drop-shadow-sm animate-[fadeIn_1s]">
        Notice
      </h2>
      <p className="mt-1 text-gray-200 animate-[fadeIn_2s]">
        Next online exam scheduled for <span className="font-semibold text-white">August 15th</span>
      </p>
    </div>

    <span className="bg-red-600 text-white text-sm md:text-base font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
      NEW
    </span>
  </div>
);



export default NoticeSection;
