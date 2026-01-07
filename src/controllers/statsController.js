import User from "../models/User.js";
import Task from "../models/Task.js";
import Submission from "../models/Submission.js";

export async function getTopWorkers(req, res, next) {
  try {
    const workers = await User.find({ role: "worker" })
      .sort({ coins: -1, updatedAt: -1 })
      .limit(6)
      .select("displayName email photoURL coins role");

    res.json({ success: true, workers });
  } catch (err) {
    next(err);
  }
}

export async function getPublicStats(req, res, next) {
  try {
    const [totalWorkers, totalBuyers, totalTasks, totalSubmissions] =
      await Promise.all([
        User.countDocuments({ role: "worker" }),
        User.countDocuments({ role: "buyer" }),
        Task.countDocuments({}),
        Submission.countDocuments({}),
      ]);

    res.json({
      success: true,
      stats: {
        totalWorkers,
        totalBuyers,
        totalTasks,
        totalSubmissions,
      },
    });
  } catch (err) {
    next(err);
  }
}