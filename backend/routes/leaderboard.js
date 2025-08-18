const express = require('express');
const router = express.Router();
const { getTopStudents } = require('../controllers/leaderboardController');

// GET /api/top-students
router.get('/top-students', getTopStudents);

module.exports = router;
