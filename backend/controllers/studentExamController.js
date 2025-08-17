const Exam = require('../models/Exam');
const StudentExam = require('../models/StudentExam');
const User = require('../models/userModel');

// =======================
// Fetch exam questions (without correct answers)
// =======================
exports.getExamForStudent = async (req, res) => {
  try {
    const { examId } = req.params;
    const student = await User.findOne({ userId: req.user.userId, role: 'student' });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Ensure this student is assigned & active
    const assigned = exam.assignedTo.find(
      a => a.studentId.toString() === student._id.toString() && a.isActive
    );
    if (!assigned) return res.status(403).json({ message: 'Exam not active for this student' });

    // Return questions without correctAnswer
    const questions = exam.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    res.json({
      examName: exam.examName,
      questions,
      duration: exam.duration,
    });
  } catch (err) {
    console.error('[ERROR] getExamForStudent:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =======================
// Submit exam answers
// =======================
exports.submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const student = await User.findOne({ userId: req.user.userId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Invalid answers payload' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Score calculation
    let score = 0;
    exam.questions.forEach(q => {
      const ans = answers[q._id];
      if (ans !== undefined && Number(ans) === q.correctAnswer) score++;
    });

    const submission = await StudentExam.create({
      student: student._id,
      exam: exam._id,
      answers,
      score,
      total: exam.questions.length,
      status: "submitted"
    });

    // Mark exam as submitted in `assignedTo`
    await Exam.updateOne(
      { _id: examId, 'assignedTo.studentId': student._id },
      { $set: { 'assignedTo.$.submitted': true } }
    );

    res.json({ message: 'Exam submitted successfully', score });
  } catch (err) {
    console.error('[ERROR] submitExam:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =======================
// Get student results (ONLY published)
// =======================
exports.getStudentResults = async (req, res) => {
  try {
    const student = await User.findOne({ userId: req.user.userId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const results = await StudentExam.find({
      student: student._id,
      isPublished: true // ✅ only published results
    })
      .populate("exam", "examName subject questions")
      .sort({ submittedAt: -1 });

    res.json(results);
  } catch (err) {
    console.error('[ERROR] getStudentResults:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
