const mongoose = require('mongoose');
const studentExamSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: { type: Map, of: Number, required: true },
  score: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },

  isPublished: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ["assigned", "submitted", "reviewed"], 
    default: "assigned" 
  },
  attemptNumber: { type: Number, default: 1 },
  submitted: { type: Boolean, default: false },

  // 🔒 New fields
  examStarted: { type: Boolean, default: false },
  examStartTime: { type: Date },
  examLock: { type: Boolean, default: false }
});
module.exports = mongoose.model('StudentExam', studentExamSchema);