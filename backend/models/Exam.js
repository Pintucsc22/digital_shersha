const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
});

const examSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  className: {type: String, required:true},
  topic: {type:String, required:true},
  date: { type: Date, required: true },
  duration: { type: String, required: true }, // in minutes
  subject: String,
  startTime: { type: Date },
  endTime: { type: Date },
  questions: [questionSchema],
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: { type: Boolean, default: false }, // only active exams are visible
  assignedClasses: [{ type: String }], // multiple classes if needed
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
