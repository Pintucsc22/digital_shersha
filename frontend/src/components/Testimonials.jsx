import React from 'react';

const testimonials = [
  "This system made exam stress-free!",
  "Loved the UI and timer!",
  "Simple and clear instructions.",
  "Helpful email results feature!",
  "I scored better than ever!",
  "The graph feature is cool!"
];

const Testimonials = () => (
  <div className="my-6">
    <h3 className="text-xl font-bold mb-2">Student Reviews</h3>
    <ul className="list-disc pl-5 space-y-1">
      {testimonials.map((text, index) => (
        <li key={index}>{text}</li>
      ))}
    </ul>
  </div>
);

export default Testimonials;
