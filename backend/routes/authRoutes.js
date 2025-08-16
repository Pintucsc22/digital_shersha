const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
//const studentUserController = require('../controllers/studentUserController');
const authMiddleware = require('../middleware/authMiddleware');

// Auth routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// ✅ Fetch student by userId (protected)
//router.get('/users/:userId', authMiddleware, studentUserController.getStudentById);

module.exports = router;
