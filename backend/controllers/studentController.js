const mongoose =require('mongoose');
const ExamModel = require('../models/Exam');
//const Question = require('../models/Question');
//const Result = require('../models/Result');
const User = require('../models/userModel');

const getAvailableExams = async (req, res) => {
  try {
    const student = await User.findOne({ userId: req.user.userId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const exams = await ExamModel.find({
      'assignedTo.studentId': student._id,
      'assignedTo.isActive': true
    }).populate('teacher', 'name email');

    console.log('Student userId:', student.userId);
    console.log('Student _id:', student._id);
    console.log('Found exams:', exams.length);

    res.json(exams);
  } catch (error) {
    console.error('Error fetching available exams:', error);
    res.status(500).json({ message: 'Error fetching exams' });
  }
};



const submitExamAnswers = async (req, res) => {
  const { examId } = req.params;
  const { answers } = req.body; // format: { questionId: selectedOptionIndex }

  try {
    const questions = await Question.find({ exam: examId });
    console.log('Exams ignoring isActive:');
    let correct = 0;

    questions.forEach(q => {
      const selected = answers[q._id];
      if (selected !== undefined && selected === q.correctAnswer) {
        correct++;
      }
    });

    const result = await Result.create({
      student: req.user.userId,
      exam: examId,
      score: correct,
      total: questions.length,
    });

    res.json({ message: 'Submitted', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting exam' });
  }
};

const getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.userId }).populate('exam');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch results' });
  }
};

module.exports = {
  getAvailableExams,
  submitExamAnswers,
  getStudentResults,
};
