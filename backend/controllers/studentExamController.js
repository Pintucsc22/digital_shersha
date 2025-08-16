const Exam = require('../models/Exam');
const StudentExam = require('../models/StudentExam');

// GET /api/student/exam/:examId
exports.getExamForStudent = async (req, res) => {
  try {
    const { examId } = req.params;
    console.log('[DEBUG] Fetching exam for student:', examId);

    const exam = await Exam.findById(examId);
    if (!exam) {
      console.log('[DEBUG] Exam not found');
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (!exam.isActive) {
      console.log('[DEBUG] Exam is not active');
      return res.status(403).json({ message: 'Exam is not active' });
    }

    const questions = exam.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    console.log('[DEBUG] Returning questions:', questions.length);

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

// POST /api/student/exam/:examId/submit
exports.submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.userId; // <-- from JWT
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Invalid answers payload' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const processedAnswers = {};
    exam.questions.forEach(q => {
      processedAnswers[q._id] = answers[q._id] !== undefined ? Number(answers[q._id]) : -1;
    });

    let score = 0;
    exam.questions.forEach(q => {
      if (processedAnswers[q._id] === q.correctAnswer) score++;
    });

    const submission = await StudentExam.create({
      student: studentId, // <-- use JWT userId
      exam: examId,
      answers: processedAnswers,
      score,
    });

    res.json({ message: 'Exam submitted successfully', score });
  } catch (err) {
    console.error('[ERROR] submitExam:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

