require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiApiKey() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in .env file');
      process.exit(1);
    }

    console.log('🔑 API Key loaded:', apiKey.substring(0, 10) + '...');
    console.log('🚀 Attempting to initialize Gemini...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    console.log('📡 Sending test request to Gemini API...');
    
    const result = await model.generateContent("Say 'Hello! API key is working correctly'");
    const response = result.response.text();

    console.log('✅ API Key is WORKING!');
    console.log('📝 Response:', response);
    process.exit(0);
  } catch (error) {
    console.error('❌ API Key test FAILED');
    console.error('Error:', error.message);
    if (error.message.includes('API key')) {
      console.error('   → The API key appears to be invalid or has issues');
    } else if (error.message.includes('429')) {
      console.error('   → Rate limit exceeded');
    } else if (error.message.includes('permission')) {
      console.error('   → Permission denied - check API key permissions');
    }
    process.exit(1);
  }
}

testGeminiApiKey();
