const Subject = require("../models/Subject");
const Mcq = require("../models/Mcq");

// ADMIN: Create a new subject
const createSubject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    const subject = await Subject.create({
      name,
      description,
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error("CREATE SUBJECT ERROR:", error);
    res.status(500).json({ message: "Failed to create subject" });
  }
};

// USER: Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 }).lean();

    // Attach MCQ count for each subject
    const counts = await Mcq.aggregate([
      { $group: { _id: "$subject", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => { countMap[c._id.toString()] = c.count; });

    const subjectsWithCount = subjects.map((s) => ({
      ...s,
      totalMcqs: countMap[s._id.toString()] || 0,
    }));

    res.status(200).json(subjectsWithCount);
  } catch (error) {
    console.error("GET SUBJECTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await subject.deleteOne();
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("DELETE SUBJECT ERROR:", error);
    res.status(500).json({ message: "Failed to delete subject" });
  }
};
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subject" });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  deleteSubject,
  getSubjectById
};
