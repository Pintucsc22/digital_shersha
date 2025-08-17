const Result = require('../models/Result');

const submitResult = async (req, res) => {
  const { studentId, examId, score } = req.body;
  const result = await Result.create({ studentId, examId, score });
  res.json(result);
};

const getStudentResults = async (req, res) => {
  const results = await Result.find({ studentId: req.params.studentId });
  res.json(results);
};

module.exports = { submitResult, getStudentResults };
