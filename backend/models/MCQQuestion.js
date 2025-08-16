const mongoose = require("mongoose");

const mcqQuestionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: String,enum: ["A", "B", "C", "D"], required: true }, // Index of the correct option in `options` array
});

module.exports = mongoose.model("MCQQuestion", mcqQuestionSchema);
