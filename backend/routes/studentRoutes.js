const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const {
  getAvailableExams,
  getStudentResults,
} = require('../controllers/studentController');

const router = express.Router();

// Overview routes
router.get('/exams', authenticate, getAvailableExams);
router.get('/results', authenticate, getStudentResults);

module.exports = router;
