const mongoose = require("mongoose");
const BehavioralQuestion = require("../models/BehavioralQuestion");
const StarResponse = require("../models/StarResponse");
const { analyzeStarResponse, generateImprovementSuggestions } = require("../services/aiService");

/**
 * Get all behavioral questions (with filtering)
 */
exports.getAllQuestions = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let filter = { isActive: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await BehavioralQuestion.find(filter).sort({ category: 1, createdAt: -1 });

    res.status(200).json(questions);
  } catch (error) {
    console.error("GET QUESTIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};

/**
 * Get random behavioral question
 */
exports.getRandomQuestion = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = { isActive: true };

    if (category) filter.category = category;

    const question = await BehavioralQuestion.aggregate([
      { $match: filter },
      { $sample: { size: 1 } },
    ]);

    if (!question.length) {
      return res.status(404).json({ message: "No questions found" });
    }

    res.status(200).json(question[0]);
  } catch (error) {
    console.error("GET RANDOM QUESTION ERROR:", error);
    res.status(500).json({ message: "Failed to fetch question" });
  }
};

/**
 * Submit STAR response with AI analysis
 */
exports.submitResponse = async (req, res) => {
  try {
    console.log('📝 Submit response called');
    const { questionId, response } = req.body;
    const userId = req.user.id;

    if (!questionId || !response || !response.situation || !response.task || !response.action || !response.result) {
      return res.status(400).json({ message: "All STAR components are required" });
    }

    console.log('✅ Validation passed');

    // Fetch question
    const question = await BehavioralQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    console.log('✅ Question found:', question.question);

    // Combine STAR into full response
    const fullResponse = `Situation: ${response.situation}\n\nTask: ${response.task}\n\nAction: ${response.action}\n\nResult: ${response.result}`;

    console.log('🤖 Calling AI analysis...');
    // Get AI feedback
    const feedback = await analyzeStarResponse(response, question);
    
    console.log('✅ AI analysis complete');

    // Save response
    const starResponse = new StarResponse({
      user: userId,
      question: questionId,
      response,
      fullResponse,
      feedback,
      status: "submitted",
    });

    await starResponse.save();
    console.log('✅ Response saved');

    res.status(201).json({
      message: "Response submitted and analyzed",
      response: starResponse,
    });
  } catch (error) {
    console.error("SUBMIT RESPONSE ERROR:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: error.message || "Failed to submit response" });
  }
};

/**
 * Get user's responses (with filtering)
 */
exports.getUserResponses = async (req, res) => {
  try {
    const { category, limit = 10, skip = 0 } = req.query;
    const userId = req.user.id;

    let pipeline = [{ $match: { user: new mongoose.Types.ObjectId(userId) } }];

    if (category) {
      pipeline.push({
        $lookup: {
          from: "behavioralquestions",
          localField: "question",
          foreignField: "_id",
          as: "questionData",
        },
      });
      pipeline.push({
        $match: {
          "questionData.category": category,
        },
      });
    }

    pipeline.push({ $sort: { submittedAt: -1 } });
    pipeline.push({ $skip: parseInt(skip) });
    pipeline.push({ $limit: parseInt(limit) });
    pipeline.push({
      $lookup: {
        from: "behavioralquestions",
        localField: "question",
        foreignField: "_id",
        as: "questionData",
      },
    });
    pipeline.push({
      $unwind: "$questionData",
    });

    const responses = await StarResponse.aggregate(pipeline);

    // Get total count
    const totalCount = await StarResponse.countDocuments({ user: userId });

    res.status(200).json({
      total: totalCount,
      responses,
    });
  } catch (error) {
    console.error("GET USER RESPONSES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch responses" });
  }
};

/**
 * Get response by ID
 */
exports.getResponseById = async (req, res) => {
  try {
    const { responseId } = req.params;
    const userId = req.user.id;

    const response = await StarResponse.findById(responseId).populate("question");

    if (!response) {
      return res.status(404).json({ message: "Response not found" });
    }

    // Check authorization
    if (response.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("GET RESPONSE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch response" });
  }
};

/**
 * Get improvement suggestions for a category
 */
exports.getImprovementSuggestions = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user.id;

    // Get previous responses in this category
    const responses = await StarResponse.find({
      user: userId,
    })
      .populate({
        path: "question",
        match: { category },
      })
      .limit(5);

    const categoryResponses = responses.filter((r) => r.question);

    if (categoryResponses.length === 0) {
      return res.status(200).json({
        suggestions: ["Start by answering questions in this category to receive personalized suggestions"],
      });
    }

    const suggestions = await generateImprovementSuggestions(category, categoryResponses);

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error("GET SUGGESTIONS ERROR:", error);
    res.status(500).json({ message: "Failed to generate suggestions" });
  }
};

/**
 * Get performance summary
 */
exports.getPerformanceSummary = async (req, res) => {
  try {
    console.log('📊 Getting performance summary for user:', req.user?.id);
    const userId = req.user.id;

    const responses = await StarResponse.find({ user: userId }).populate("question");
    console.log('📊 Found responses:', responses.length);

    // Filter out responses with deleted questions
    const validResponses = responses.filter(r => r.question !== null);
    console.log('📊 Valid responses with questions:', validResponses.length);

    if (!validResponses.length) {
      return res.status(200).json({
        totalResponses: 0,
        averageScore: 0,
        byCategory: {},
        topStrengths: [],
        areasToImprove: [],
      });
    }

    // Calculate stats by category
    const byCategory = {};
    validResponses.forEach((r) => {
      const cat = r.question.category;
      if (!byCategory[cat]) {
        byCategory[cat] = { count: 0, totalScore: 0, scores: [] };
      }
      byCategory[cat].count++;
      byCategory[cat].totalScore += r.feedback.overallScore || 0;
      byCategory[cat].scores.push(r.feedback.overallScore || 0);
    });

    // Calculate averages
    Object.keys(byCategory).forEach((cat) => {
      byCategory[cat].average = byCategory[cat].totalScore / byCategory[cat].count;
    });

    // Get top strengths and areas to improve
    const allStrengths = [];
    const allImprovements = [];

    validResponses.forEach((r) => {
      allStrengths.push(...(r.feedback.strengths || []));
      allImprovements.push(...(r.feedback.improvements || []));
    });

    // Count frequency
    const strengthCounts = {};
    const improvementCounts = {};

    allStrengths.forEach((s) => {
      strengthCounts[s] = (strengthCounts[s] || 0) + 1;
    });

    allImprovements.forEach((i) => {
      improvementCounts[i] = (improvementCounts[i] || 0) + 1;
    });

    const topStrengths = Object.entries(strengthCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([str]) => str);

    const areasToImprove = Object.entries(improvementCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([str]) => str);

    const averageScore = (validResponses.reduce((sum, r) => sum + (r.feedback.overallScore || 0), 0) / validResponses.length).toFixed(1);

    res.status(200).json({
      totalResponses: validResponses.length,
      averageScore,
      byCategory,
      topStrengths,
      areasToImprove,
    });
  } catch (error) {
    console.error("GET SUMMARY ERROR:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: error.message || "Failed to fetch summary" });
  }
};

/**
 * Create behavioral question (Admin only)
 */
exports.createQuestion = async (req, res) => {
  try {
    const { question, category, difficulty, description, tips } = req.body;

    if (!question || !category || !description) {
      return res.status(400).json({ message: "Question, category, and description are required" });
    }

    const newQuestion = new BehavioralQuestion({
      question,
      category,
      difficulty: difficulty || "medium",
      description,
      tips: tips || [],
    });

    await newQuestion.save();

    res.status(201).json({
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error("CREATE QUESTION ERROR:", error);
    res.status(500).json({ message: "Failed to create question" });
  }
};

/**
 * Update behavioral question (Admin only)
 */
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updates = req.body;

    const question = await BehavioralQuestion.findByIdAndUpdate(questionId, updates, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    console.error("UPDATE QUESTION ERROR:", error);
    res.status(500).json({ message: "Failed to update question" });
  }
};

/**
 * Delete behavioral question (Admin only)
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await BehavioralQuestion.findByIdAndDelete(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("DELETE QUESTION ERROR:", error);
    res.status(500).json({ message: "Failed to delete question" });
  }
};
