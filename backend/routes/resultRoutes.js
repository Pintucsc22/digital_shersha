const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
router.get('/exam/:examId', async (req, res) => {
  try {
    const results = await Result.find({ examId: req.params.examId }).populate('studentId', 'name email');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch results' });
  }
});

module.exports = router;
