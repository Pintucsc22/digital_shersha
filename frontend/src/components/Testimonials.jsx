import React from 'react';

const testimonials = [
  "This system made exam stress-free!",
  "Loved the UI and timer!",
  "Simple and clear instructions.",
  "I scored better than ever!",
  "The graph feature is cool!"
];

const Testimonials = () => (
  <div className="my-6 p-4 md:p-6 bg-gray-900 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-[1.02]">
    <h3 className="text-xl md:text-2xl font-bold mb-4 text-yellow-300 drop-shadow-md animate-[fadeIn_1s]">
      Student Reviews
    </h3>
    <ul className="space-y-2">
      {testimonials.map((text, index) => (
        <li
          key={index}
          className="bg-gray-800 text-gray-200 px-4 py-2 rounded-lg shadow-sm animate-[fadeIn_2s]"
        >
          {text}
        </li>
      ))}
    </ul>
  </div>
);

export default Testimonials;
