// routes/teacherQuestionsRoutes.js
const express = require('express');
const router = express.Router();
const {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByExam
} = require('../controllers/questionController');

const auth = require('../middleware/authMiddleware');

const { assignStudentToExam } = require('../controllers/teacherExamController');

// ✅ Teacher-only routes for managing questions
router.post('/:examId', auth, createQuestion); // Add question to exam
router.put('/:id', auth, updateQuestion); // Edit question
router.delete('/:id', auth, deleteQuestion); // Delete question
router.get('/exam/:examId', auth, getQuestionsByExam); // Get questions for an exam
router.post('/exams/:examId/assign-student', auth, assignStudentToExam); // Assign student to exam


module.exports = router;
