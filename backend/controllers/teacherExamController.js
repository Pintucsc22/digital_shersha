const Exam = require('../models/Exam');
const User = require('../models/userModel');

// 📌 Create exam - only for teachers
const createExam = async (req, res) => {
  try {
    // Ensure only teachers can create an exam
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create exams' });
    }
    //validate required fields
    const { examName, className, topic, date, duration } = req.body;
    if (!examName || !className || !topic || !date || !duration) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Finds the teacher in DB, returns 404 if not found
    const teacherUser = await User.findOne({ userId: req.user.userId });
    if (!teacherUser) return res.status(404).json({ message: 'Teacher not found' });

    console.log("Incoming request body:", req.body);
    console.log("Teacher from DB:", teacherUser);
    // create a new exam
    const exam = await Exam.create({
      examName,
      className,
      topic,
      date: new Date(date),
      duration,
      teacher: teacherUser._id
    });

    res.status(201).json(exam);
  } catch (err) {
    console.error("❌ Exam creation failed:", err);
    res.status(500).json({ message: 'Server error during exam creation' });
  }
};

// 📌 Update exam - only by teacher who owns it
const updateExam = async (req, res) => {
  try {
    const { examName, className, topic, date, duration } = req.body;
    //Fetches exam by ID, return 404 if not found
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    //Verifies teacher exists
    const teacherUser = await User.findOne({ userId: req.user.userId });
    if (!teacherUser) return res.status(403).json({ message: "Not Authorized" });
    // Checks if the logged in teacher owns this exam
    if (exam.teacher.toString() !== teacherUser._id.toString()) {
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
    //Ensures only teachers can view their exams
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can view their exams' });
    }
    // finds teacher in db
    const teacherUser = await User.findOne({ userId: req.user.userId });
    if (!teacherUser) return res.status(404).json({ message: 'Teacher not found' });
    //Returns all exams owned by this teacher
    const exams = await Exam.find({ teacher: teacherUser._id });
    res.json(exams);
  } catch (err) {
    console.error("❌ Error fetching exams:", err);
    res.status(500).json({ message: 'Error fetching exams' });
  }
};

// 📌 Delete exam - only by teacher who owns it
const deleteExam = async (req, res) => {
  try {

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can delete exams' });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    // Only teacher who owns the exam can delete
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
const assignStudentToExam = async (req, res) => {
  try{
  const {examId} =req.params;
  const {studentId} =req.body;
// Find Student by Id
  const student =await User.findOne({userId: studentId, role: 'student'});
  if (!student) {return res.status(404).json({message: 'Student not found'})};
// Find exam by Id
  const exam =await Exam.findById(examId);
  if(!exam) {return res.status(404).json({message: 'Exam not found'})};
// Avoid duplicate assignment
  if (!exam.assignedTo.includes(student._id)) {
    exam.assignedTo.push(student._id);
    await exam.save();
  }
  res.json({message: 'Student assigned', student});
} catch (err) {
  console.log ('Error assign student:', err);
  res.status(500).json({ message:'Server error while assigning student'});
}
};

module.exports = {
  createExam,
  updateExam,
  getExamsByTeacher,
  deleteExam,
  assignStudentToExam,
};
