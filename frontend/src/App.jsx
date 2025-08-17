
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import TeacherExamControlSubmission from './pages/TeacherExamControlSubmission';
import TeacherDashboard from './pages/TeacherDashboard';
import QuestionManager from './components/McqQuestionManager';
import MCQPage from './pages/MCQpage';

import StudentExamPage from './pages/student/StudentExamPage';


// ✅ Define the main App component
const App = () => {
  return (
    
    <BrowserRouter>
      {/* ✅ Use Routes to define different pages/components for URLs */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />        
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/exam/:id/submissions" element={<TeacherExamControlSubmission />} />

        {/* ✅ When the URL is "/exam/:id", render the ExamPage component with the dynamic "id" */}
        {/* //last import */}
         <Route path="/student/exam/:examId" element={<StudentExamPage />} />
        


        <Route path="/manage-questions/:examId" element={<QuestionManager />} />
        


        <Route path="/teacher/exam/:id/mcqs" element={<MCQPage />} />
      </Routes>
    </BrowserRouter>
  );
};

// ✅ Export the App component so it can be used in index.js
export default App;
