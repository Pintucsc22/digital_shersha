const express = require('express');
const router = express.Router();
const {
  createExam,
  getExamsByTeacher,
  deleteExam,
  updateExam,
  assignStudentToExam,
  getExamSubmissions,
  publishSubmission
} = require('../controllers/teacherExamController');

const auth = require('../middleware/authMiddleware');

// ✅ All teacher routes are protected
router.post('/', auth, createExam); // Create exam
router.get('/', auth, getExamsByTeacher); // Get all exams created by logged-in teacher
router.put('/:id', auth, updateExam); // Update exam
router.delete('/:id', auth, deleteExam); // Delete exam

// Assign student to exam
router.post('/:examId/assign', auth, assignStudentToExam);

// 📌 New routes for submissions
router.get('/:examId/submissions', auth, getExamSubmissions);
router.patch('/submissions/:submissionId/publish', auth, publishSubmission);

module.exports = router;
