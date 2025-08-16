// ✅ Import the React library to use JSX and build components
import React from 'react';



// ✅ Import routing components from react-router-dom for page navigation
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ✅ Import the Home page component
import Home from './pages/Home';

// ✅ Import the StudentDashboard component
// import StudentDashboard from './pages/StudentDashboard';


 import TeacherDashboard from './pages/TeacherDashboard';

// ✅ Import the ExamPage component for dynamic routing (e.g. /exam/123)
//import ExamPage from './pages/ExamPage';
//import QuestionManager from './components/QuestionManager';
// import MCQPage from './pages/MCQpage';
// import StudentExamPage from './pages/student/StudentExamPage';

// ✅ Define the main App component
const App = () => {
  return (
    // ✅ Wrap the entire app in BrowserRouter to enable routing
    <BrowserRouter>
      {/* ✅ Use Routes to define different pages/components for URLs */}
      <Routes>
        {/* ✅ When the URL is "/", render the Home component */}
        <Route path="/" element={<Home />} />

        {/* ✅ When the URL is "/student-dashboard", render the StudentDashboard component */}
        {/* <Route path="/student-dashboard" element={<StudentDashboard />} /> */}

        
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        {/* <Route path="/teacher" element={<TeacherDashboard />} /> */}

        {/* ✅ When the URL is "/exam/:id", render the ExamPage component with the dynamic "id" */}
         {/* <Route path="/student/exam/:examId" element={<StudentExamPage />} />  */}
        {/* <Route path="/manage-questions/:examId" element={<QuestionManager />} />
        <Route path="/student/exam/:examId" element={<TakeExam />} /> */}
        {/* <Route path="/teacher/exam/:id/mcqs" element={<MCQPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

// ✅ Export the App component so it can be used in index.js
export default App;
