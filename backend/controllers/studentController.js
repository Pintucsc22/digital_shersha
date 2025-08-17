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

    res.json(exams);
  } catch (error) {
    console.error('[ERROR] getAvailableExams:', error);
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

    const results = await StudentExam.find({ 
        student: student._id,
        isPublished: true // Only published results
      })
      .populate('exam', 'examName topic date duration questions')
      .sort({ submittedAt: -1 });

    // Format results to include total questions / score
    const formattedResults = results.map(r => ({
      submissionId: r._id,
      examName: r.exam?.examName || 'Exam',
      topic: r.exam?.topic || 'N/A',
      date: r.exam?.date || null,
      duration: r.exam?.duration || null,
      score: r.score || 0,
      total: r.exam?.questions?.length || 0
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error('[ERROR] getStudentResults:', err);
    res.status(500).json({ message: 'Failed to fetch results' });
  }
};

module.exports = {
  getAvailableExams,
  getStudentResults,
};
