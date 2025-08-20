const os = require("os");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Security & logging
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Routes
const mcqRoutes = require("./routes/mcqRoutes");
const studentRoutes = require("./routes/studentRoutes");
const studentExamRoutes = require("./routes/studentExamRoutes");
const leaderboardRoutes = require("./routes/leaderboard");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet()); // secure HTTP headers

// Logging (only in dev mode)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting (protect against brute force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests per IP
});
app.use("/api/", limiter);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/teacher/exams", require("./routes/teacherExamRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/email", require("./routes/emailRoutes"));
app.use("/api/mcq", mcqRoutes);
app.use("/api/teacherQuestions", require("./routes/teacherQuestionsRoutes"));
app.use("/api/", require("./routes/studentUserRoutes"));
app.use("/api/student/exam", studentExamRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/student/results", require("./routes/studentResultRoutes"));
app.use("/api", leaderboardRoutes);

// Error handler (catch unexpected errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  const interfaces = os.networkInterfaces();
  let addresses = [];
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  console.log(`🚀 Server running:`);
  console.log(`- Local:   http://localhost:${PORT}`);
  addresses.forEach((ip) => console.log(`- Network: http://${ip}:${PORT}`));
});
