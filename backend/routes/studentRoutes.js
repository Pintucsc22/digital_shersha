const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const {
  getAvailableExams,
  submitExamAnswers,
  getStudentResults,
} = require('../controllers/studentController');

const router = express.Router();

router.get('/exams', authenticate, getAvailableExams); // All published exams
router.post('/submit/:examId', authenticate, submitExamAnswers);
router.get('/results', authenticate, getStudentResults); // View own results

module.exports = router;
