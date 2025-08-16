const express = require('express');
const router = express.Router();
const { getExamForStudent, submitExam } = require('../controllers/studentExamController');
const auth = require('../middleware/authMiddleware'); // ensures only logged-in students can access

// ✅ Fetch exam questions (without correct answers)
router.get('/:examId', auth, getExamForStudent);

// ✅ Submit exam answers
router.post('/:examId/submit', auth, submitExam);

module.exports = router;
