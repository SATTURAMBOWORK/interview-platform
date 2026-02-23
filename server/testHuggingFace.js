require('dotenv').config();
const { HfInference } = require("@huggingface/inference");

async function testHuggingFaceAPI() {
  try {
    const huggingFaceToken = process.env.HUGGING_FACE_TOKEN;
    
    if (!huggingFaceToken) {
      console.error('❌ HUGGING_FACE_TOKEN not found in .env file');
      console.log('📝 Get a free token from: https://huggingface.co/settings/tokens');
      process.exit(1);
    }

    console.log('🔑 Hugging Face token loaded');
    console.log('🚀 Attempting to call Hugging Face API...');

    const client = new HfInference(huggingFaceToken);
    
    const response = await client.textGeneration({
      model: "gpt2",
      inputs: "Tell me about interview preparation for software engineers.",
      parameters: {
        max_new_tokens: 50,
      }
    });

    console.log('✅ Hugging Face API is WORKING!');
    console.log('📝 Response:', JSON.stringify(response, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('❌ Hugging Face API test FAILED');
    console.error('Error:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

testHuggingFaceAPI();
