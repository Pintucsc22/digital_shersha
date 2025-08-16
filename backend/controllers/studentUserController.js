const User = require('../models/userModel');


// Get student by userId
exports.getStudentById = async (req, res) => {
  try {
    const { userId } = req.params;

    const student = await User.findOne({ userId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json(student);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
        