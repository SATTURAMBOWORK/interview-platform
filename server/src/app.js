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
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const resumeRoutes = require("./routes/resumeRoutes");





// ✅ middleware FIRST
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, "http://localhost:5173"]
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
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
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/resume", resumeRoutes);





app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

module.exports = app;
