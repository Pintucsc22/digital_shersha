const Exam = require("../models/Exam");

// Get all MCQs for an exam
const getMCQsByExam = async (req, res) => {
  try {
    const { id } = req.params; // exam ID
    const exam = await Exam.findById(id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam.questions || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching MCQs" });
  }
};

// Add a new MCQ
const addMCQ = async (req, res) => {
  try {
    const { id } = req.params; // exam ID
    const { question, options, correctOption } = req.body;

    if (!question || !options || options.length !== 4 || !["A","B","C","D"].includes(correctOption)) {
      return res.status(400).json({ message: "Invalid question data" });
    }

    const exam = await Exam.findById(id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const newQuestion = {
      question,
      options,
      correctAnswer: ["A","B","C","D"].indexOf(correctOption) // convert A-D to 0-3
    };

    exam.questions.push(newQuestion);
    await exam.save();

    res.status(201).json(newQuestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding MCQ" });
  }
};

// Update MCQ
const updateMCQ = async (req, res) => {
  try {
    const { examId, mcqIndex } = req.params; // mcqIndex is the index in exam.questions array
    const { question, options, correctOption } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    if (!exam.questions[mcqIndex]) return res.status(404).json({ message: "MCQ not found" });

    if (question) exam.questions[mcqIndex].question = question;
    if (options && options.length === 4) exam.questions[mcqIndex].options = options;
    if (correctOption && ["A","B","C","D"].includes(correctOption)) {
      exam.questions[mcqIndex].correctAnswer = ["A","B","C","D"].indexOf(correctOption);
    }

    await exam.save();
    res.json(exam.questions[mcqIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating MCQ" });
  }
};

// Delete MCQ
const deleteMCQ = async (req, res) => {
  try {
    const { examId, mcqIndex } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    if (!exam.questions[mcqIndex]) return res.status(404).json({ message: "MCQ not found" });

    exam.questions.splice(mcqIndex, 1);
    await exam.save();

    res.json({ message: "MCQ deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting MCQ" });
  }
};

module.exports = { getMCQsByExam, addMCQ, updateMCQ, deleteMCQ };
