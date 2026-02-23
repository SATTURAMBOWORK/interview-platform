const mongoose = require("mongoose");
const Mcq = require("../models/Mcq");
const Subject = require("../models/Subject");

/**
 * ============================
 * CREATE MCQ
 * ============================
 */
const createMcq = async (req, res) => {
  try {
    const { subject, question, options, correctOption, difficulty } = req.body;

    if (!subject || !question || !options || correctOption === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res
        .status(400)
        .json({ message: "Exactly 4 options are required" });
    }

    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const mcq = await Mcq.create({
      subject,
      question,
      options,
      correctOption,
      difficulty: difficulty || "easy",
    });

    res.status(201).json(mcq);
  } catch (error) {
    console.error("CREATE MCQ ERROR:", error);
    res.status(500).json({ message: "Failed to create MCQ" });
  }
};

/**
 * ============================
 * GET ALL MCQS (ADMIN)
 * ============================
 */
const getAllMcqs = async (req, res) => {
  try {
    const mcqs = await Mcq.find()
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(mcqs);
  } catch (error) {
    console.error("GET ALL MCQS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch MCQs" });
  }
};

/**
 * ============================
 * GET RANDOM MCQS (USER TEST)
 * ============================
 */
const getRandomMcqsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (limit > 50) {
      return res
        .status(400)
        .json({ message: "Limit cannot exceed 50" });
    }

    const subjectExists = await Subject.findById(subjectId);
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const subjectObjectId = new mongoose.Types.ObjectId(subjectId);

    const mcqs = await Mcq.aggregate([
      { $match: { subject: subjectObjectId } },
      { $sample: { size: limit } },
    ]);

    res.status(200).json(mcqs);
  } catch (error) {
    console.error("GET RANDOM MCQS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch MCQs" });
  }
};

/**
 * ============================
 * BULK UPLOAD MCQS
 * ============================
 */
const bulkUploadMcqs = async (req, res) => {
  try {
    const { subject, mcqs } = req.body;

    if (!subject || !Array.isArray(mcqs) || mcqs.length === 0) {
      return res.status(400).json({
        message: "Subject and MCQs array are required",
      });
    }

    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const preparedMcqs = mcqs.map((mcq, index) => {
      const { question, options, correctOption, difficulty } = mcq;

      if (
        !question ||
        !options ||
        options.length !== 4 ||
        correctOption === undefined
      ) {
        throw new Error(`Invalid MCQ at index ${index}`);
      }

      return {
        subject,
        question,
        options,
        correctOption,
        difficulty: difficulty || "easy",
      };
    });

    const inserted = await Mcq.insertMany(preparedMcqs);

    res.status(201).json({
      message: "Bulk MCQs uploaded successfully",
      count: inserted.length,
    });
  } catch (error) {
    console.error("BULK UPLOAD ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
};

/**
 * ============================
 * DELETE MCQ
 * ============================
 */
const deleteMcq = async (req, res) => {
  try {
    const { id } = req.params;

    const mcq = await Mcq.findById(id);
    if (!mcq) {
      return res.status(404).json({ message: "MCQ not found" });
    }

    await mcq.deleteOne();
    res.status(200).json({ message: "MCQ deleted successfully" });
  } catch (error) {
    console.error("DELETE MCQ ERROR:", error);
    res.status(500).json({ message: "Failed to delete MCQ" });
  }
};

/**
 * ============================
 * UPDATE MCQ
 * ============================
 */
const updateMcq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctOption, difficulty } = req.body;

    const mcq = await Mcq.findById(id);
    if (!mcq) {
      return res.status(404).json({ message: "MCQ not found" });
    }

    if (question) mcq.question = question;
    if (options && options.length === 4) mcq.options = options;
    if (correctOption !== undefined) mcq.correctOption = correctOption;
    if (difficulty) mcq.difficulty = difficulty;

    await mcq.save();
    res.status(200).json(mcq);
  } catch (error) {
    console.error("UPDATE MCQ ERROR:", error);
    res.status(500).json({ message: "Failed to update MCQ" });
  }
};

module.exports = {
  createMcq,
  getAllMcqs,
  getRandomMcqsBySubject,
  bulkUploadMcqs,
  deleteMcq,
  updateMcq,
};
