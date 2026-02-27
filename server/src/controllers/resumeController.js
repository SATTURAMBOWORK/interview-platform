const pdfParse = require("pdf-parse");
const { analyzeResumeVsJD } = require("../services/aiService");

/**
 * POST /api/resume/analyze
 * Accepts: multipart/form-data with fields:
 *   - resume (PDF file) OR resumeText (plain text)
 *   - jobDescription (string)
 */
const analyzeResume = async (req, res) => {
  try {
    const { jobDescription, resumeText: rawText } = req.body;

    if (!jobDescription || jobDescription.trim().length < 30) {
      return res.status(400).json({ message: "Job description is required (min 30 chars)." });
    }

    let resumeText = "";

    // If a PDF was uploaded, extract text
    if (req.file) {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } else if (rawText && rawText.trim().length > 50) {
      resumeText = rawText.trim();
    } else {
      return res.status(400).json({ message: "Provide a resume PDF or paste resume text (min 50 chars)." });
    }

    if (resumeText.length < 50) {
      return res.status(400).json({ message: "Could not extract enough text from the PDF. Try pasting as text." });
    }

    const analysis = await analyzeResumeVsJD(resumeText, jobDescription.trim());
    return res.status(200).json(analysis);
  } catch (error) {
    console.error("Resume analysis error:", error);
    return res.status(500).json({ message: "Failed to analyze resume. Please try again." });
  }
};

module.exports = { analyzeResume };
