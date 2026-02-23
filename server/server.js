const app = require("./src/app");
const mongoose = require("mongoose");
require("dotenv").config();
const seedBehavioralQuestions = require("./src/seeds/seedBehavioralQuestions");
const axios = require("axios");

const PORT = process.env.PORT || 5000;

// Warm up Ollama on server start
const warmUpOllama = async () => {
  try {
    console.log("🔥 Warming up Ollama...");
    await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'mistral',
        prompt: 'Hello',
        stream: false,
      },
      { timeout: 120000 }
    );
    console.log("✅ Ollama is ready!");
  } catch (error) {
    console.log("⚠️  Ollama not available (will use Gemini as fallback)");
  }
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    
    // Seed behavioral questions on startup
    try {
      await seedBehavioralQuestions();
      console.log("Behavioral questions seeded successfully");
    } catch (error) {
      console.error("Error seeding behavioral questions:", error.message);
    }

    // Warm up Ollama in background
    warmUpOllama();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed", err);
  });
