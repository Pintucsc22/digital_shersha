const mongoose = require('mongoose');

const studentExamSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: { type: Map, of: Number, required: true }, // { questionId: selectedOptionIndex }
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentExam', studentExamSchema);
