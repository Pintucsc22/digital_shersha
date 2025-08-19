const mongoose = require('mongoose');

const studentExamSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: { type: Map, of: Number, required: true }, // { questionId: selectedOptionIndex }
  score: { type: Number, default: 0 },
  total: { type: Number, default: 0 }, // total number of questions
  submittedAt: { type: Date, default: Date.now },

  // ✅ New Fields
  isPublished: { type: Boolean, default: false }, // Teacher controls if results are visible
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Teacher who reviewed/approved
  status: { 
    type: String, 
    enum: ["assigned", "submitted", "reviewed"], 
    default: "assigned" 
  }, // To track flow

  // ✅ Track multiple attempts
  attemptNumber: { type: Number, default: 1 }, // Current attempt
  submitted: { type: Boolean, default: false }  // Flag if this attempt is submitted
});

module.exports = mongoose.model('StudentExam', studentExamSchema);
