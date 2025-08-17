
const Exam = require('../models/Exam');
const StudentExam = require('../models/StudentExam');
const User = require('../models/userModel');

// =======================
// GET all available exams for logged-in student
// =======================
const getAvailableExams = async (req, res) => {
  try {
    const student = await User.findOne({ userId: req.user.userId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Find exams where this student is assigned & active
    const exams = await Exam.find({
      'assignedTo.studentId': student._id,
      'assignedTo.isActive': true
    }).populate('teacher', 'name email');

    console.log('[DEBUG] Student userId:', student.userId);
    console.log('[DEBUG] Found exams:', exams.length);

    res.json(exams);
  } catch (error) {
    console.error('Error fetching available exams:', error);
    res.status(500).json({ message: 'Error fetching exams' });
  }
};

// =======================
// GET results of logged-in student
// =======================
const getStudentResults = async (req, res) => {
  try {
    const student = await User.findOne({ userId: req.user.userId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const results = await StudentExam.find({ student: student._id })
      .populate('exam', 'examName subject date duration')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    console.error('Error fetching student results:', err);
    res.status(500).json({ message: 'Failed to fetch results' });
  }
};

module.exports = {
  getAvailableExams,
  getStudentResults,
};
