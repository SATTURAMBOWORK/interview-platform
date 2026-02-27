const Groq = require('groq-sdk');

// Lazy initialization so dotenv is loaded before this runs
const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Check available service (Groq only)
 */
const checkAvailableService = async () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('No AI service available. Add GROQ_API_KEY to .env');
  }
  console.log('✅ Using Groq API');
  return 'groq';
};

/**
 * Analyze STAR response using Groq
 */
const analyzeStarResponse = async (starResponse, question) => {
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

  try {
    const responseText = await callGroq(prompt);
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
 * Call Groq API
 */
const callGroq = async (prompt) => {
  try {
    console.log('🔄 Calling Groq...');
    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    console.log('✅ Groq response received');
    return completion.choices[0].message.content;
  } catch (error) {
    throw new Error(`Groq error: ${error.message}`);
  }
};

/**
 * Generate personalized improvement suggestions
 */
const generateImprovementSuggestions = async (category, previousResponses) => {
  const responsesSummary = previousResponses
    .map(
      (r) =>
        `Score: ${r.feedback.overallScore}/100, Feedback: ${r.feedback.overallFeedback}`
    )
    .join('\n');

  const prompt = `Based on these ${category} interview response scores:

${responsesSummary}

Provide 5 specific tips to improve. Return as JSON array only:
["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]`;

  try {
    const responseText = await callGroq(prompt);
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse suggestions');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI SUGGESTIONS ERROR:', error);
    return [];
  }
};

/**
 * Analyze resume vs job description and return ATS score + feedback
 */
const analyzeResumeVsJD = async (resumeText, jobDescription) => {
  const prompt = `You are an ATS (Applicant Tracking System) and senior technical recruiter.

Analyze the following resume against the job description and return ONLY a valid JSON object (no markdown, no explanation).

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return this exact JSON structure:
{
  "overallScore": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "keywordsMatched": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "keywordsMissing": ["<missing1>", "<missing2>", "<missing3>"],
  "sections": {
    "skills": { "score": <0-100>, "comment": "<brief comment>" },
    "experience": { "score": <0-100>, "comment": "<brief comment>" },
    "education": { "score": <0-100>, "comment": "<brief comment>" },
    "formatting": { "score": <0-100>, "comment": "<brief comment>" }
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"],
  "verdict": "<one of: Strong Match | Good Match | Partial Match | Weak Match>"
}`;

  try {
    const responseText = await callGroq(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse resume analysis response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing resume vs JD:', error);
    throw error;
  }
};

module.exports = { analyzeStarResponse, checkAvailableService, generateImprovementSuggestions, analyzeResumeVsJD };
