const Exam = require('../models/Exam');
const User = require('../models/userModel');
const StudentExam = require('../models/StudentExam');

// 📌 Create exam - only for teachers
const createExam = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create exams' });
    }

    const { examName, className, topic, date, duration } = req.body;
    if (!examName || !className || !topic || !date || !duration) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const teacherUser = await User.findOne({ userId: req.user.userId });
    if (!teacherUser) return res.status(404).json({ message: 'Teacher not found' });

    const exam = await Exam.create({
      examName,
      className,
      topic,
      date: new Date(date),
      duration,
      teacher: teacherUser._id,
    });

    res.status(201).json(exam);
  } catch (err) {
    console.error("❌ Exam creation failed:", err);
    res.status(500).json({ message: 'Server error during exam creation' });
  }
};

// 📌 Update exam
const updateExam = async (req, res) => {
  try {
    const { examName, className, topic, date, duration } = req.body;

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const teacherUser = await User.findOne({ userId: req.user.userId });
    if (!teacherUser || exam.teacher.toString() !== teacherUser._id.toString()) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    exam.examName = examName ?? exam.examName;
    exam.className = className ?? exam.className;
    exam.topic = topic ?? exam.topic;
    exam.date = date ? new Date(date) : exam.date;
    exam.duration = duration ?? exam.duration;

    await exam.save();
    res.json(exam);
  } catch (err) {
    console.error("❌ Error updating exam:", err);
    res.status(500).json({ message: 'Error updating exam' });
  }
};

// 📌 Get all exams for logged-in teacher
const getExamsByTeacher = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can view their exams' });
    }

    const teacherUser = await User.findOne({ userId: req.user.userId });
    if (!teacherUser) return res.status(404).json({ message: 'Teacher not found' });

    const exams = await Exam.find({ teacher: teacherUser._id });
    res.json(exams);
  } catch (err) {
    console.error("❌ Error fetching exams:", err);
    res.status(500).json({ message: 'Error fetching exams' });
  }
};

// 📌 Delete exam
const deleteExam = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can delete exams' });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const teacherUser = await User.findOne({ userId: req.user.userId });
    if (!teacherUser || exam.teacher.toString() !== teacherUser._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this exam' });
    }

    await exam.deleteOne();
    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    console.error("❌ Error deleting exam:", err);
    res.status(500).json({ message: 'Error deleting exam' });
  }
};

// 📌 Assign student to exam
const assignStudentToExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId } = req.body;

    const student = await User.findOne({ userId: studentId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const existing = exam.assignedTo.find(
      s => s.studentId.toString() === student._id.toString()
    );

    if (!existing) {
      exam.assignedTo.push({ studentId: student._id, isActive: true, submitted: false });
    } else {
      existing.isActive = true; // Reactivate if previously inactive
    }

    await exam.save();
    res.json({ message: 'Student assigned and activated for exam', student });
  } catch (err) {
    console.error('❌ Error assigning student:', err);
    res.status(500).json({ message: 'Server error while assigning student' });
  }
};

// 📌 Get submissions for a specific exam
const getExamSubmissions = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const teacherUser = await User.findOne({ userId: req.user.userId });
    if (!teacherUser || exam.teacher.toString() !== teacherUser._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view submissions' });
    }

    const submissions = await StudentExam.find({ exam: examId })
      .populate('student', 'name userId')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error("❌ Error fetching submissions:", err);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};

// 📌 Publish result for a student submission
const publishSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await StudentExam.findById(submissionId).populate('exam');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const teacherUser = await User.findOne({ userId: req.user.userId });
    if (!teacherUser || submission.exam.teacher.toString() !== teacherUser._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to publish result' });
    }

    // ✅ Calculate score if not done
    if (!submission.score && submission.answers) {
      let score = 0;
      const examQuestions = submission.exam.questions || [];
      examQuestions.forEach(q => {
        const ansIndex = submission.answers.get(q._id.toString());
        if (ansIndex === q.correctAnswer) score++;
      });
      submission.score = score;
    }

    // ✅ Set total questions
    submission.total = submission.exam.questions.length;

    submission.isPublished = true;
    submission.reviewedBy = teacherUser._id;
    submission.status = "reviewed";

    await submission.save();
    res.json({ message: 'Result published successfully', submission });
  } catch (err) {
    console.error("❌ Error publishing result:", err);
    res.status(500).json({ message: 'Error publishing result' });
  }
};

module.exports = {
  createExam,
  updateExam,
  getExamsByTeacher,
  deleteExam,
  assignStudentToExam,
  getExamSubmissions,
  publishSubmission,
};
