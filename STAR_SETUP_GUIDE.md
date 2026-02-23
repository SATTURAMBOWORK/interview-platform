# STAR Interview Feature Setup Guide

## Overview
The STAR-based behavioral interview feature uses Google's Gemini API to analyze user responses to behavioral interview questions and provide real-time feedback on clarity, impact, and completeness.

## What You Need to Do

### 1. Install Dependencies

Run this in the **server** directory:
```bash
npm install @google/generative-ai
```

### 2. Set Up Environment Variables

Add to your `.env` file in the **server** directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free Gemini API key from: https://ai.google.dev/

### 3. Seed the Database

The behavioral questions are automatically seeded when you start the server. If you need to reseed manually:

```bash
# In server directory
node -e "require('dotenv').config(); require('mongoose').connect(process.env.MONGO_URI).then(() => require('./src/seeds/seedBehavioralQuestions')().then(() => process.exit(0)).catch(() => process.exit(1)))"
```

### 4. API Endpoints Overview

#### User Endpoints
- **GET /api/behavioral/questions** - Get all questions (with optional filters)
- **GET /api/behavioral/question/random** - Get a random question
- **POST /api/behavioral/response/submit** - Submit a response (gets AI feedback)
- **GET /api/behavioral/responses** - Get user's past responses
- **GET /api/behavioral/response/:responseId** - Get a specific response
- **GET /api/behavioral/suggestions/:category** - Get category-specific improvement suggestions
- **GET /api/behavioral/performance/summary** - Get user's overall performance

#### Admin Endpoints
- **POST /api/behavioral/question/create** - Create a new question
- **PUT /api/behavioral/question/:questionId** - Update a question
- **DELETE /api/behavioral/question/:questionId** - Delete a question

### 5. Features Included

✅ **56 Behavioral Questions** across 7 categories:
- Leadership (8 questions)
- Teamwork (8 questions)
- Problem-Solving (10 questions)
- Communication (8 questions)
- Conflict Resolution (7 questions)
- Adaptability (7 questions)
- Customer Focus (6 questions)

✅ **AI-Powered Feedback** using Gemini API:
- Clarity Score (0-10)
- Impact Score (0-10)
- Completeness Score (0-10)
- Overall Score (0-100)
- Personalized feedback for each metric
- Strengths identification
- Improvement suggestions

✅ **Performance Tracking**:
- View all previous responses
- Filter by category
- Track performance trends
- Get category-specific suggestions
- View performance summary

### 6. Frontend Integration

The STAR Interview feature is accessible at: `/star-interview`

Key Components:
- **StarInterview.jsx** - Main dashboard and category selection
- **StarQuestion.jsx** - Question display and STAR response collection
- **ResponseAnalysis.jsx** - AI feedback display
- **BehavioralProgress.jsx** - Response history and tracking

### 7. How to Use

1. Navigate to the STAR Interview section from the dashboard
2. Choose a category (Leadership, Teamwork, etc.)
3. Read the question and tips provided
4. Fill in all STAR components:
   - **S**ituation: Set the context
   - **T**ask: What was assigned to you
   - **A**ction: What did you do
   - **R**esult: What was the outcome
5. Submit your response
6. View AI-powered feedback with scores and suggestions
7. Review past responses and track improvement

### 8. Customizing Questions

You can add more questions via the admin panel or directly insert into MongoDB:

```javascript
{
  question: "Your question here?",
  category: "Leadership", // or other category
  difficulty: "medium",
  description: "What this question tests",
  tips: [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ]
}
```

### 9. Troubleshooting

**Issue: "Failed to analyze response"**
- Check that GEMINI_API_KEY is set correctly
- Ensure you have API calls remaining on your Gemini account
- Add error logging to geminiService.js for debugging

**Issue: No questions appearing**
- Run the seed script to populate questions
- Check MongoDB connection
- Verify questions are marked as isActive: true

**Issue: API errors**
- Check server logs for specific error messages
- Verify all environment variables are set
- Ensure the behavioral routes are registered in app.js

### 10. Database Schema

**BehavioralQuestion**
```javascript
{
  question: String,
  category: String (enum),
  difficulty: String (easy/medium/hard),
  description: String,
  tips: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**StarResponse**
```javascript
{
  user: ObjectId (ref User),
  question: ObjectId (ref BehavioralQuestion),
  response: {
    situation: String,
    task: String,
    action: String,
    result: String
  },
  feedback: {
    clarity: { score: Number, comment: String },
    impact: { score: Number, comment: String },
    completeness: { score: Number, comment: String },
    overallScore: Number,
    overallFeedback: String,
    improvements: [String],
    strengths: [String]
  },
  status: String,
  submittedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Best Practices

1. **Rate Limiting**: Consider adding rate limiting to prevent API abuse with Gemini
2. **Caching**: Cache questions to reduce database queries
3. **Feedback Quality**: Customize Gemini prompts based on difficulty level
4. **Error Handling**: Implement graceful fallbacks if Gemini API is unavailable
5. **Analytics**: Track which categories users struggle with most

## Future Enhancements

- Mock interview mode (timed responses)
- Difficulty progression system
- Video response support
- Comparison with similar responses
- Peer feedback system
- Interview coaching tips
