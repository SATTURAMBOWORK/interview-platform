require('dotenv').config();
const axios = require('axios');

async function testOllamaAPI() {
  try {
    console.log('🔑 Attempting to connect to Ollama...');
    console.log('📍 Server: http://localhost:11434');

    const response = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'mistral',
        prompt: 'Say "Hello! Ollama is working correctly"',
        stream: false,
      },
      {
        timeout: 30000
      }
    );

    console.log('✅ Ollama is WORKING!');
    console.log('📝 Response:', response.data.response);
    process.exit(0);
  } catch (error) {
    console.error('❌ Ollama test FAILED');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   → Ollama is not running');
      console.error('   → Start Ollama and try again');
    } else if (error.message.includes('timeout')) {
      console.error('   → Request timed out (model might still be loading)');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testOllamaAPI();
