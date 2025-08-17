const express = require('express');
const auth= require('../middleware/authMiddleware');
const {
  getExamForStudent,
  submitExam,
  getStudentResults, // ✅ now coming from StudentExamController
} = require('../controllers/studentExamController');

const router = express.Router();

// Fetch questions for a specific exam
router.get('/:examId', auth, getExamForStudent);

// Submit exam answers
router.post('/:examId/submit', auth, submitExam);

// Get all published results for the logged-in student
router.get('/results', auth, getStudentResults);

module.exports = router;
