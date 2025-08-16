const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [
      {
        label: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
        text: { type: String, required: true }
      }
    ],
    validate: {
      validator: arr => arr.length === 4,
      message: 'Exactly 4 options required'
    }
  },
  correctAnswer: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  }
});

// Export the model properly:
const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;
