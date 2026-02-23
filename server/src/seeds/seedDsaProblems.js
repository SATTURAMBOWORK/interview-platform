const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const DsaProblem = require("../models/DsaProblem");
const problems = require("./dsaProblems_arrays.json");

// 🔴 PUT YOUR ADMIN USER _id HERE
const ADMIN_ID = "6967546d38baf3cffa90a8ba";

const seedDsaProblems = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await DsaProblem.deleteMany({});
    console.log("Old DSA problems removed");

    const finalProblems = problems.map((p) => ({
      ...p,
      createdBy: ADMIN_ID,
    }));

    await DsaProblem.insertMany(finalProblems);
    console.log(`Inserted ${finalProblems.length} DSA problems`);

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

seedDsaProblems();
