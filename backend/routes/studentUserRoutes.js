const express = require('express');
const router = express.Router();
const studentUserController = require('../controllers/studentUserController');
const authMiddleware = require('../middleware/authMiddleware');

// Fetch student by userId
router.get('/users/:userId', authMiddleware, studentUserController.getStudentById);

module.exports = router;
