const express = require('express');
const router = express.Router();
//const { sendScorecard } = require('../controllers/emailController');
const auth = require('../middleware/authMiddleware');

//router.post('/scorecard', auth, sendScorecard);

module.exports = router;
