require('dotenv').config();
const mongoose = require('mongoose');
const seedBehavioralQuestions = require('./src/seeds/seedBehavioralQuestions');

const runSeed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB');

    // Run seed
    await seedBehavioralQuestions();

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
