const Subject = require("../models/Subject");

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
    const subjects = await Subject.find().sort({ name: 1 });
    res.status(200).json(subjects);
  } catch (error) {
    console.error("GET SUBJECTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
};
