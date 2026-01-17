const Attempt = require("../models/Attempt");
const Mcq = require("../models/Mcq");

const submitAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, answers } = req.body;

    if (!subject || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid attempt data" });
    }

    let score = 0;
    const evaluatedAnswers = [];

    for (const ans of answers) {
      const mcq = await Mcq.findById(ans.mcq);
      if (!mcq) continue;

      const isCorrect = mcq.correctOption === ans.selectedOption;
      if (isCorrect) score++;

      evaluatedAnswers.push({
        mcq: mcq._id,
        selectedOption: ans.selectedOption,
        correctOption: mcq.correctOption,
        isCorrect,
      });
    }

    const attempt = await Attempt.create({
      user: userId,
      subject,
      answers: evaluatedAnswers,
      score,
      totalQuestions: evaluatedAnswers.length,
    });

    res.status(201).json({
      message: "Attempt submitted successfully",
      score,
      totalQuestions: evaluatedAnswers.length,
    });
  } catch (error) {
    console.error("SUBMIT ATTEMPT ERROR:", error);
    res.status(500).json({ message: "Failed to submit attempt" });
  }
};
const getMyAttempts = async (req, res) => {
  try {
    // Step 1: get logged-in user's id from JWT
    const userId = req.user.id;

    // Step 2: find all attempts by this user
    const attempts = await Attempt.find({ user: userId })
      // Step 3: replace subject ObjectId with subject name
      .populate("subject", "name")
      // Step 4: newest attempt first
      .sort({ createdAt: -1 });

    // Step 5: send result
    res.status(200).json(attempts);
  } catch (error) {
    console.error("GET MY ATTEMPTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
};
const getAttemptById = async (req, res) => {
  try {
    // Step 1: extract attemptId from URL
    const { attemptId } = req.params;

    // Step 2: fetch attempt and populate MCQs + subject
    const attempt = await Attempt.findById(attemptId)
      .populate("subject", "name")
      .populate("answers.mcq", "question options");

    // Step 3: if attempt not found
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // Step 4: authorization check (VERY IMPORTANT)
    if (attempt.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Step 5: return full attempt details
    res.status(200).json(attempt);
  } catch (error) {
    console.error("GET ATTEMPT BY ID ERROR:", error);
    res.status(500).json({ message: "Failed to fetch attempt details" });
  }
};



module.exports = { submitAttempt, getMyAttempts, getAttemptById };
