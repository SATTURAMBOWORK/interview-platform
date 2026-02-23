const Submission = require("../models/Submission");

/**
 * GET /api/dsa/calendar
 * Returns daily accepted submission counts
 */
exports.getDsaCalendar = async (req, res) => {
  try {
    const userId = req.user._id;

    const calendarData = await Submission.aggregate([
      {
        $match: {
          userId,
          status: "Accepted",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json(
      calendarData.map((d) => ({
        date: d._id,
        count: d.count,
      }))
    );
  } catch (err) {
    console.error("DSA CALENDAR ERROR:", err);
    res.status(500).json({ message: "Failed to fetch calendar data" });
  }
};
