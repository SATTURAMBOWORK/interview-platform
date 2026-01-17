const Attempt = require("../models/Attempt");

const getOverallAnalytics = async (req, res) => {
  try {
    // Step 1: get user id from token
    const userId = req.user.id;

    // Step 2: fetch all attempts of this user
    const attempts = await Attempt.find({ user: userId });

    // Step 3: initialize counters
    let totalAttempts = attempts.length;
    let totalQuestions = 0;
    let totalCorrect = 0;

    // Step 4: loop through attempts
    for (const attempt of attempts) {
      totalQuestions += attempt.totalQuestions;
      totalCorrect += attempt.score;
    }

    // Step 5: calculate accuracy %
    const accuracy =
      totalQuestions === 0
        ? 0
        : ((totalCorrect / totalQuestions) * 100).toFixed(2);

    // Step 6: return analytics
    res.status(200).json({
      totalAttempts,
      totalQuestions,
      totalCorrect,
      accuracy: Number(accuracy),
    });
  } catch (error) {
    console.error("OVERALL ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

const getSubjectWiseAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const attempts = await Attempt.find({ user: userId }).populate(
      "subject",
      "name"
    );

    const subjectMap = {};

    for (const attempt of attempts) {
      // IMPORTANT FIX
      const subjectId =
        typeof attempt.subject === "object"
          ? attempt.subject.id.toString()
          : attempt.subject.toString();

      if (!subjectMap[subjectId]) {
        subjectMap[subjectId] = {
          subjectName:
            typeof attempt.subject === "object"
              ? attempt.subject.name
              : "Unknown",
          attempts: 0,
          totalQuestions: 0,
          totalCorrect: 0,
        };
      }

      subjectMap[subjectId].attempts += 1;
      subjectMap[subjectId].totalQuestions += attempt.totalQuestions;
      subjectMap[subjectId].totalCorrect += attempt.score;
    }

    const result = Object.values(subjectMap).map((item) => ({
      subject: item.subjectName,
      attempts: item.attempts,
      accuracy:
        item.totalQuestions === 0
          ? 0
          : Number(
              ((item.totalCorrect / item.totalQuestions) * 100).toFixed(2)
            ),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("SUBJECT ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch subject analytics" });
  }
};


module.exports = { getOverallAnalytics, getSubjectWiseAnalytics };
