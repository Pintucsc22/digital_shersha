const Exam = require('../models/Exam');
const StudentExam = require('../models/StudentExam');
const User = require('../models/userModel');

// =======================
// Fetch exam questions (without correct answers)
// =======================
// studentExamController.js
exports.getExamForStudent = async (req, res) => {
  try {
    const { examId } = req.params;
    const student = await User.findOne({ userId: req.user.userId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const assigned = exam.assignedTo.find(
      a => a.studentId.toString() === student._id.toString() && a.isActive
    );

    // Instead of 403 / 204, just send JSON with remainingAttempts
    const remainingAttempts = assigned ? 3 - (assigned.attempts || 0) : 0;

    // Return data even if max attempts reached
    res.status(200).json({
      examName: exam.examName,
      questions: exam.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options
      })),
      duration: exam.duration,
      attemptCount: assigned?.attempts || 0,
      remainingAttempts,
      isActive: !!assigned
    });
  } catch (err) {
    console.error('[ERROR] getExamForStudent:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



// =======================
// Submit exam answers or auto-save
// =======================
exports.submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const student = await User.findOne({ userId: req.user.userId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { answers } = req.body; // can be empty object {}

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Ensure student is assigned & active
    const assignedIndex = exam.assignedTo.findIndex(
      a => a.studentId.toString() === student._id.toString() && a.isActive
    );
    if (assignedIndex === -1) return res.status(403).json({ message: 'Exam not active for this student' });

    const assigned = exam.assignedTo[assignedIndex];
    const currentAttempt = assigned.attempts || 0;

    if (currentAttempt >= 3) {
      return res.status(403).json({ message: 'Maximum 3 attempts reached' });
    }

    // Score calculation (only if answers exist)
    let score = 0;
    if (answers && Object.keys(answers).length > 0) {
      exam.questions.forEach(q => {
        const ans = answers[q._id];
        if (ans !== undefined && Number(ans) === q.correctAnswer) score++;
      });
    }

    // Create StudentExam record
    const submission = await StudentExam.create({
      student: student._id,
      exam: exam._id,
      answers: answers || {}, // even empty object
      score,
      total: exam.questions.length,
      status: 'submitted',
      attemptNumber: currentAttempt + 1
    });

    // Increment attempt count in exam.assignedTo
    exam.assignedTo[assignedIndex].attempts = currentAttempt + 1;

    // Only mark as submitted if actual answers exist
    if (answers && Object.keys(answers).length > 0) {
      exam.assignedTo[assignedIndex].submitted = true;
    }

    await exam.save();

    res.json({
      message: 'Exam submitted successfully',
      score,
      attemptNumber: currentAttempt + 1,
      remainingAttempts: 3 - (currentAttempt + 1)
    });
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
      isPublished: true
    })
      .populate("exam", "examName subject questions")
      .sort({ submittedAt: -1 });

    res.json(results);
  } catch (err) {
    console.error('[ERROR] getStudentResults:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
