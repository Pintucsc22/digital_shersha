
const os = require('os');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mcqRoutes = require("./routes/mcqRoutes");
const studentRoutes =require('./routes/studentRoutes');
const studentExamRoutes =require('./routes/studentExamRoutes')
const leaderboardRoutes = require('./routes/leaderboard'); // Import leaderboard routes

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());



// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/teacher/exams', require('./routes/teacherExamRoutes')); // ✅ Teacher exams
app.use('/api/results', require('./routes/resultRoutes'));//last import
app.use('/api/email', require('./routes/emailRoutes'));

// Questions (Teacher Only)
//app.use('/api/teacher/questions', require('./routes/teacherQuestionsRoutes'));
//mcqRoutes
app. use("/api/mcq", mcqRoutes);
app.use('/api/teacherQuestions', require('./routes/teacherQuestionsRoutes'));
app.use('/api/', require('./routes/studentUserRoutes'));
app.use('/api/student/exam', studentExamRoutes);
app.use('/api/student', studentRoutes);
app.use("/api/student/results", require("./routes/studentResultRoutes"));
app.use('/api', leaderboardRoutes); // Use leaderboard routes


// Student-specific question fetching (no correct answers)
// app.use('/api/student/questions', require('./routes/studentQuestionsRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  let addresses = [];
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  console.log(`Server running:`);
  console.log(`- Local: http://localhost:${PORT}`);
  addresses.forEach(ip => console.log(`- Network: http://${ip}:${PORT}`));
});
