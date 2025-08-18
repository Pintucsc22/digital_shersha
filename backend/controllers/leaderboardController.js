const User = require('../models/userModel');
const StudentExam = require('../models/StudentExam');

// GET top students by exams completed
const getTopStudents = async (req, res) => {
  try {
    // Find all students
    const students = await User.find({ role: 'student' }).select('_id name');

    // Count exams completed for each student
    const topStudents = await Promise.all(
      students.map(async (student) => {
        const examsCompleted = await StudentExam.countDocuments({
          student: student._id,
          isPublished: true
        });
        return {
          name: student.name,
          examsCompleted
        };
      })
    );

    // Sort descending and limit top 10
    topStudents.sort((a, b) => b.examsCompleted - a.examsCompleted);
    const top10 = topStudents.slice(0, 10);

    res.json(top10);
  } catch (err) {
    console.error('[ERROR] getTopStudents:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTopStudents };
