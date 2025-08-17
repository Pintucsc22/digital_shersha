const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const StudentExam = require("../models/StudentExam");

// GET student’s own result by examId (only if published)
router.get("/:examId", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id; // logged-in student
    const examId = req.params.examId;

    const result = await StudentExam.findOne({
      student: studentId,
      exam: examId,
      isPublished: true, // ✅ only allow published results
    })
      .populate("exam", "examName date")
      .lean();

    if (!result) {
      return res.status(404).json({ message: "Result not found or not published yet" });
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching student result:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
