const Question = require('../models/Question');

// Create a question
const createQuestion = async (req, res) => {
  const { examId, questionText, options, correctAnswer } = req.body;

  if (!questionText || !options || correctAnswer === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (options.length !== 4) {
    return res.status(400).json({ message: 'Exactly 4 options required' });
  }

  try {
    const question = await Question.create({
      exam: examId,
      questionText,
      options,
      correctAnswer,
    });
    res.status(201).json(question);
  } catch (err) {
    console.error("❌ Error creating question:", err);
    res.status(500).json({ message: 'Server error during question creation' });
  }
};

// Get all questions for a specific exam
const getQuestionsByExam = async (req, res) => {
  try {
    const questions = await Question.find({ exam: req.params.examId });
    res.json(questions);
  } catch (err) {
    console.error("❌ Error fetching questions:", err);
    res.status(500).json({ message: 'Error fetching questions' });
  }
};

// Edit a question
const updateQuestion = async (req, res) => {
  const { questionText, options, correctAnswer } = req.body;

  if (!questionText || !options || correctAnswer === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (options.length !== 4) {
    return res.status(400).json({ message: 'Exactly 4 options required' });
  }

  try {
    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      { questionText, options, correctAnswer },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating question:", err);
    res.status(500).json({ message: 'Error updating question' });
  }
};

// Delete a question
const deleteQuestion = async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error("❌ Error deleting question:", err);
    res.status(500).json({ message: 'Error deleting question' });
  }
};

module.exports = {
  createQuestion,
  getQuestionsByExam,
  updateQuestion,
  deleteQuestion,
};
