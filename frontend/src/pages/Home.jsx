import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import NoticeSection from '../components/NoticeSection';
import LeaderboardWrapper from '../components/LeaderboardWrapper';
import Testimonials from '../components/Testimonials';
import ChatBox from '../components/ChatBox'; // Reusable ChatBox
import apjSirImage from '../assets/apj_abdul_kalam_sir.png';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [popupType, setPopupType] = useState(null); // 'login' or 'register'

  // Redirect if already logged in
  useEffect(() => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
    }

    if (user) {
      if (user.role === 'teacher') navigate('/teacher');
      else if (user.role === 'student') navigate('/student');
    }
  }, [navigate]);

  // Show popup if URL has ?auth=login or ?auth=register
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const auth = query.get('auth');
    if (auth === 'login' || auth === 'register') {
      setPopupType(auth);
    }
  }, [location]);

  const handleClosePopup = () => {
    setPopupType(null);
    const params = new URLSearchParams(location.search);
    params.delete('auth');
    navigate({ pathname: '/', search: params.toString() ? `?${params.toString()}` : '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 scroll-smooth">
      <Header />

      <main className="p-6 max-w-7xl mx-auto">
        <NoticeSection />

        {/* Motivational Quote Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 my-8 
                        bg-gray-900 p-6 rounded-2xl shadow-xl transform transition-all duration-500 
                        hover:scale-[1.02] hover:shadow-2xl">
          {/* Image */}
          <img
            src={apjSirImage}
            alt="APJ Abdul Kalam Sir"
            className="w-full md:w-1/3 rounded-xl shadow-2xl border-4 border-yellow-500
                      transform transition-transform duration-700 hover:scale-105 hover:animate-pulse"
          />

          {/* Quote & Leaderboard */}
          <div className="w-full md:w-2/3 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 
                          drop-shadow-[0_0_10px_rgba(255,255,0,0.7)] animate-bounce">
              Motivational Quote
            </h2>

            <blockquote className="mb-6 italic text-lg md:text-xl text-gray-200 
                                  border-l-4 border-yellow-400 pl-4 relative 
                                  before:content-['“'] before:absolute before:-left-3 before:text-4xl before:text-yellow-400 
                                  after:content-['”'] after:text-4xl after:text-yellow-400 
                                  hover:text-yellow-300 transition-colors duration-300">
              "Education is the passport to the future." <br />
              "You have to dream before your dreams can come true."
            </blockquote>

            <div className="bg-gray-800 p-4 rounded-xl shadow-inner mt-4 transition-transform duration-500 hover:scale-[1.02]">
              <LeaderboardWrapper />
            </div>
          </div>
        </div>

        <Testimonials />

        {/* Why this exam is important */}
        <section className="bg-gray-800 p-6 rounded-2xl my-6 shadow-md transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-yellow-300 drop-shadow-md animate-[fadeIn_1s]">
            Why this exam is important?
          </h2>
          <p className="mt-2 text-gray-200 animate-[fadeIn_2s]">
            Our platform prepares students for real competitive exams in an <span className="text-yellow-300 font-semibold">interactive</span> and <span className="text-yellow-300 font-semibold">efficient</span> manner.
          </p>
        </section>
      </main>

      <Footer />

      {/* Reusable ChatBox for login/register */}
      {popupType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <ChatBox type={popupType} onClose={handleClosePopup} />
        </div>
      )}
    </div>
  );
};

export default Home;
