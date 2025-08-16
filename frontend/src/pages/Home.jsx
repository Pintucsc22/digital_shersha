import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NoticeSection from '../components/NoticeSection';
import ScoreGraph from '../components/ScoreGraph';
import Testimonials from '../components/Testimonials';
import AuthPopupWrapper from '../components/auth/AuthPopupWrapper';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [popupType, setPopupType] = useState(null); // 'login' or 'register'

  useEffect(() => {
    // ✅ If user is logged in, redirect them
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      if (user.role === 'teacher') {
        navigate('/teacher');
      } else if (user.role === 'student') {
        navigate('/student');
      }
    }
  }, [navigate]);

  useEffect(() => {
    // ✅ Check URL query ?auth=login or ?auth=register
    const query = new URLSearchParams(location.search);
    const auth = query.get("auth");
    if (auth === "login" || auth === "register") {
      setPopupType(auth);
    }
  }, [location]);

  const handleClosePopup = () => {
    setPopupType(null);
    // ✅ Remove query param from URL
    const params = new URLSearchParams(location.search);
    params.delete("auth");
    navigate({ pathname: "/", search: params.toString() });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-6">
        <NoticeSection />
        <div className="flex gap-4 my-6">
          <img
            src="https://via.placeholder.com/150"
            alt="Owner"
            className="w-1/3 rounded shadow"
          />
          <div className="w-2/3">
            <h2 className="text-2xl font-semibold mb-2">Motivational Quote</h2>
            <p className="mb-4 italic">"Education is the passport to the future."</p>
            <ScoreGraph />
          </div>
        </div>
        <Testimonials />
        <div className="bg-blue-100 p-4 rounded my-6">
          <h2 className="text-xl font-bold">Why this exam is important?</h2>
          <p className="mt-2">
            Our platform prepares students for real competitive exams in an interactive and efficient manner.
          </p>
        </div>
      </div>
      <Footer />

      {/* ✅ Show login/register popup if requested in URL */}
      {popupType && <AuthPopupWrapper type={popupType} onClose={handleClosePopup} />}
    </div>
  );
};

export default Home;
