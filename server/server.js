const app = require("./src/app");
const mongoose = require("mongoose");
require("dotenv").config();
const seedBehavioralQuestions = require("./src/seeds/seedBehavioralQuestions");
const axios = require("axios");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const validateEnv = () => {
  if (!MONGO_URI) {
    throw new Error(
      "Missing MONGO_URI. Set a MongoDB Atlas URI in deployment environment variables."
    );
  }

  const lowerUri = String(MONGO_URI).toLowerCase();
  if (process.env.NODE_ENV === "production" && lowerUri.includes("127.0.0.1")) {
    throw new Error(
      "Invalid production MONGO_URI: localhost/127.0.0.1 is not reachable on Render. Use MongoDB Atlas URI."
    );
  }
};

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

try {
  validateEnv();
} catch (error) {
  console.error("Environment validation failed:", error.message);
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
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
    console.error("MongoDB connection failed", err.message || err);
    process.exit(1);
  });
