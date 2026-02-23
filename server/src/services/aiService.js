const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');

// Try to use Ollama first (local), fall back to Gemini
let useOllama = false;
let useGemini = false;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Check which AI service is available
 */
const checkAvailableService = async () => {
  // Check Ollama first
  try {
    await axios.get('http://localhost:11434/api/tags', { timeout: 2000 });
    useOllama = true;
    console.log('✅ Using Ollama (Local AI)');
    return 'ollama';
  } catch (e) {
    console.log('⏸️  Ollama not available');
  }

  // Fall back to Gemini
  if (process.env.GEMINI_API_KEY) {
    useGemini = true;
    console.log('✅ Using Gemini API');
    return 'gemini';
  }

  throw new Error('No AI service available. Install Ollama or add GEMINI_API_KEY');
};

/**
 * Analyze STAR response using available AI service
 */
const analyzeStarResponse = async (starResponse, question) => {
  try {
    let service;
    try {
      service = await checkAvailableService();
    } catch (e) {
      throw new Error('No AI service available');
    }

    const prompt = `Analyze this STAR interview response and provide feedback in JSON format.

Question: ${question.question}
Category: ${question.category}

Response:
Situation: ${starResponse.situation}
Task: ${starResponse.task}
Action: ${starResponse.action}
Result: ${starResponse.result}

Provide JSON (no markdown):
{
  "clarity": {"score": <0-10>, "comment": "<brief comment>"},
  "impact": {"score": <0-10>, "comment": "<brief comment>"},
  "completeness": {"score": <0-10>, "comment": "<brief comment>"},
  "overallScore": <0-100>,
  "overallFeedback": "<2-3 sentences>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}`;

    let responseText;

    if (service === 'ollama') {
      try {
        responseText = await callOllama(prompt);
      } catch (ollamaError) {
        console.log('⚠️  Ollama failed, falling back to Gemini:', ollamaError.message);
        // Fall back to Gemini if Ollama fails
        if (process.env.GEMINI_API_KEY) {
          responseText = await callGemini(prompt);
        } else {
          throw ollamaError;
        }
      }
    } else {
      responseText = await callGemini(prompt);
    }

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing STAR response:', error);
    throw error;
  }
};

/**
 * Call Ollama API (local)
 */
const callOllama = async (prompt) => {
  try {
    console.log('🔄 Calling Ollama...');
    const response = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'mistral',
        prompt: prompt,
        stream: false,
      },
      {
        timeout: 200000 // 90 seconds - if it takes longer, fallback to Gemini
      }
    );
    console.log('✅ Ollama response received');
    return response.data.response;
  } catch (error) {
    throw new Error(`Ollama error: ${error.message}`);
  }
};

/**
 * Call Gemini API (cloud)
 */
const callGemini = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    throw new Error(`Gemini error: ${error.message}`);
  }
};

/**
 * Generate personalized improvement suggestions
 */
const generateImprovementSuggestions = async (category, previousResponses) => {
  try {
    const service = await checkAvailableService();

    const responsesSummary = previousResponses
      .map(
        (r) =>
          `Score: ${r.feedback.overallScore}/100, Feedback: ${r.feedback.overallFeedback}`
      )
      .join("\n");

    const prompt = `Based on these ${category} interview response scores:

${responsesSummary}

Provide 5 specific tips to improve. Return as JSON array only:
["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]`;

    let responseText;
    if (service === 'ollama') {
      responseText = await callOllama(prompt);
    } else {
      responseText = await callGemini(prompt);
    }

    // Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Could not parse suggestions");
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    return suggestions;
  } catch (error) {
    console.error("AI SUGGESTIONS ERROR:", error);
    return [];
  }
};

module.exports = { analyzeStarResponse, checkAvailableService, generateImprovementSuggestions };
