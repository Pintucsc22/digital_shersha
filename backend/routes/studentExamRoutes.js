const express = require('express');
const auth = require('../middleware/authMiddleware');
const { getExamForStudent, submitExam } = require('../controllers/studentExamController');

const router = express.Router();

// Exam session routes
router.get('/:examId', auth, getExamForStudent);
router.post('/:examId/submit', auth, submitExam);

module.exports = router;
