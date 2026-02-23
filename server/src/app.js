const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const mcqRoutes = require("./routes/mcqRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const analyticsRoutes = require("./routes/analyticRoutes");
const dsaProblemRoutes = require("./routes/dsaProblemRoutes");
const dsaBrowseRoutes = require("./routes/dsaBrowseRoutes");
const dsaExecutionRoutes = require("./routes/dsaExecutionRoutes");
const dsaUserRoutes = require("./routes/dsaUserRoutes");
const dsaStatsRoutes = require("./routes/dsaStatsRoutes");
const behavioralRoutes = require("./routes/behavioralRoutes");





// ✅ middleware FIRST
app.use(cors());
app.use(express.json());

// ✅ routes AFTER middleware
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/mcqs", mcqRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dsa", dsaUserRoutes);    
app.use("/api/dsa", dsaBrowseRoutes);      // ✅ USER browsing
app.use("/api/admin/dsa", dsaProblemRoutes); // ✅ ADMIN CRUD
app.use("/api/dsa", dsaExecutionRoutes);
app.use("/api/dsa", dsaStatsRoutes);
app.use("/api/behavioral", behavioralRoutes);





app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

module.exports = app;
