const express = require('express');
const router = express.Router();
const { getAvailableExams, getStudentResults } = require('../controllers/studentController');
const auth = require('../middleware/authMiddleware');

router.get('/exams', auth, getAvailableExams); // ✅ must be a function
router.get('/results', auth, getStudentResults); // ✅ must be a function

module.exports = router;
