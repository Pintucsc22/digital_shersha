const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getMCQsByExam, addMCQ, updateMCQ, deleteMCQ } = require("../controllers/mcqController");

// Get all MCQs for an exam
router.get("/:id/mcqs", auth, getMCQsByExam);

// Add new MCQ
router.post("/:id/mcqs", auth, addMCQ);

// Update MCQ
// mcqIndex is the index of question in exam.questions array
router.put("/:examId/mcq/:mcqIndex", auth, updateMCQ);

// Delete MCQ
router.delete("/:examId/mcq/:mcqIndex", auth, deleteMCQ);

module.exports = router;
