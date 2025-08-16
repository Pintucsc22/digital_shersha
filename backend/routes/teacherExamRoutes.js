// routes/teacherExamRoutes.js
const express = require('express');
const router = express.Router();
const {
  createExam,
  getExamsByTeacher,
  getExamById,
  deleteExam,
  updateExam,
} = require('../controllers/teacherExamController'); // ✅ Matches controller file exactly

const auth = require('../middleware/authMiddleware');

// ✅ All teacher routes are protected
router.post('/', auth, createExam); // Create exam
router.get('/', auth, getExamsByTeacher); // Get all exams created by logged-in teacher
// router.get('/:id', auth, getExamById); // Get single exam with results
router.delete('/:id', auth, deleteExam); // Delete exam
router.put('/:id', auth, updateExam);

module.exports = router;
