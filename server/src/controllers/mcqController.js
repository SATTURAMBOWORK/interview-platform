const mongoose = require("mongoose");
const Mcq = require("../models/Mcq");
const Subject = require("../models/Subject");

const createMcq = async (req, res) => {
  try {
    const { subject, question, options, correctOption, difficulty } = req.body;

    if (!subject || !question || !options || correctOption === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: "Exactly 4 options are required" });
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
      difficulty,
    });

    res.status(201).json(mcq);
  } catch (error) {
    console.error("CREATE MCQ ERROR:", error);
    res.status(500).json({ message: "Failed to create MCQ" });
  }
};

const getRandomMcqsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (limit > 50) {
      return res.status(400).json({ message: "Limit cannot exceed 50" });
    }

    const subjectExists = await Subject.findById(subjectId);
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Convert subjectId to ObjectId for aggregation
    const subjectObjectId = new mongoose.Types.ObjectId(subjectId);
    const mcqs = await Mcq.aggregate([
      { $match: { subject: subjectObjectId } },
      { $sample: { size: limit } },
    ]).exec();

    res.status(200).json(mcqs);
  } catch (error) {
    console.error("GET RANDOM MCQS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch MCQs" });
  }
};


const bulkUploadMcqs = async (req, res) => {
  try {
    const { subject, mcqs } = req.body;

    // Step 1: basic validation
    if (!subject || !Array.isArray(mcqs) || mcqs.length === 0) {
      return res.status(400).json({
        message: "Subject and MCQs array are required",
      });
    }

    // Step 2: validate subject exists
    const subjectExists = await require("../models/Subject").findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Step 3: prepare MCQs
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

    // Step 4: insert in bulk
    const inserted = await require("../models/Mcq").insertMany(preparedMcqs);

    res.status(201).json({
      message: "Bulk MCQs uploaded successfully",
      count: inserted.length,
    });
  } catch (error) {
    console.error("BULK UPLOAD ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createMcq,
  getRandomMcqsBySubject,
  bulkUploadMcqs,
};
