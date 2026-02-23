const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze STAR response using Gemini API
 */
const analyzeStarResponse = async (starResponse, question) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an expert interview coach analyzing a STAR (Situation, Task, Action, Result) interview response.

Question: ${question.question}
Category: ${question.category}

User's Response:
Situation: ${starResponse.situation}
Task: ${starResponse.task}
Action: ${starResponse.action}
Result: ${starResponse.result}

Please analyze this response and provide feedback in the following JSON format:
{
  "clarity": {
    "score": <number 0-10>,
    "comment": "<detailed comment about clarity of expression>"
  },
  "impact": {
    "score": <number 0-10>,
    "comment": "<comment about the impact and relevance of the response>"
  },
  "completeness": {
    "score": <number 0-10>,
    "comment": "<comment on whether all STAR components are well-developed>"
  },
  "overallScore": <number 0-100>,
  "overallFeedback": "<comprehensive feedback on the overall response>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}

Be constructive, specific, and provide actionable feedback. Score based on industry standards for behavioral interviews.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse feedback from AI response");
    }

    const feedback = JSON.parse(jsonMatch[0]);
    return feedback;
  } catch (error) {
    console.error("GEMINI API ERROR:", error);
    throw new Error("Failed to analyze response. Please try again later.");
  }
};

/**
 * Generate personalized improvement suggestions
 */
const generateImprovementSuggestions = async (category, previousResponses) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const responsesSummary = previousResponses
      .map(
        (r) =>
          `Score: ${r.feedback.overallScore}/100, Feedback: ${r.feedback.overallFeedback}`
      )
      .join("\n");

    const prompt = `
Based on a user's previous ${category} interview responses:

${responsesSummary}

Provide 5 specific, actionable tips to improve their ${category} interview responses. Format as a JSON array of strings.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Could not parse suggestions");
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    return suggestions;
  } catch (error) {
    console.error("GEMINI SUGGESTIONS ERROR:", error);
    return [];
  }
};

module.exports = {
  analyzeStarResponse,
  generateImprovementSuggestions,
};
