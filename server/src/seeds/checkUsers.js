const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

/**
 * Diagnostic script to check what users exist in database
 */
async function checkUsers() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/interview";
    console.log(`📡 Connecting to: ${mongoUri}\n`);
    
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Get all users
    const allUsers = await User.find({});
    console.log(`📊 Total users in database: ${allUsers.length}\n`);
    
    if (allUsers.length > 0) {
      console.log("Users found:");
      console.log("─".repeat(80));
      allUsers.forEach((user, idx) => {
        console.log(`\n${idx + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Email Type: ${typeof user.email}`);
        console.log(`   Username: ${user.username || "NOT SET"}`);
      });
      console.log("\n" + "─".repeat(80));
    } else {
      console.log("❌ No users found in database");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkUsers();
