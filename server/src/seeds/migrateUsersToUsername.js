const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

/**
 * Direct migration to add usernames to existing users
 */
async function migrateUsersToUsername() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/interview");
    console.log("✅ Connected to MongoDB");

    // Define users to migrate with their target usernames
    const usersToMigrate = [
      { email: "test@gmail.com", username: "test" },
      { email: "admin@gmail.com", username: "admin" },
      { email: "prashant@gmail.com", username: "prashant" },
      { email: "sachin@gmail.com", username: "sachin" },
    ];

    console.log(`📊 Adding usernames to ${usersToMigrate.length} users...\n`);

    let migratedCount = 0;
    const results = [];

    for (const { email, username } of usersToMigrate) {
      try {
        const user = await User.findOne({ email });
        
        if (!user) {
          console.log(`⚠️  User not found: ${email}`);
          results.push(`⚠️  User not found: ${email}`);
          continue;
        }

        if (user.username) {
          console.log(`⏭️  Already has username: ${email} (${user.username})`);
          results.push(`⏭️  Already has username: ${email} (${user.username})`);
          continue;
        }

        // Update with username
        await User.findByIdAndUpdate(
          user._id,
          { username },
          { new: true }
        );

        console.log(`✅ ${email} → username: ${username}`);
        results.push(`✅ ${email} → username: ${username}`);
        migratedCount++;
      } catch (err) {
        const errorMsg = `❌ Failed to migrate ${email}: ${err.message}`;
        console.error(errorMsg);
        results.push(errorMsg);
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`   Successfully migrated: ${migratedCount}/${usersToMigrate.length} users`);
    console.log(`\nDetailed Results:`);
    results.forEach(result => console.log(`   ${result}`));

    await mongoose.connection.close();
    console.log("\n✅ Migration completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateUsersToUsername();
