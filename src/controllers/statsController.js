import User from '../models/User.js'
import Task from '../models/Task.js'
import Submission from '../models/Submission.js'
import Payment from "../models/Payment.js";

export async function getTopWorkers(req, res, next) {
  try {
    const workers = await User.find({ role: 'worker' })
      .sort({ coins: -1, updatedAt: -1 })
      .limit(6)
      .select('displayName email photoURL coins role')

    res.json({ success: true, workers })
  } catch (err) {
    next(err)
  }
}

export async function getPublicStats(req, res, next) {
  try {
    const [totalWorkers, totalBuyers, totalTasks, totalSubmissions] =
      await Promise.all([
        User.countDocuments({ role: 'worker' }),
        User.countDocuments({ role: 'buyer' }),
        Task.countDocuments({}),
        Submission.countDocuments({}),
      ])

    res.json({
      success: true,
      stats: {
        totalWorkers,
        totalBuyers,
        totalTasks,
        totalSubmissions,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getBuyerSummary(req, res, next) {
  try {
    const buyerEmail = req.user?.email
    if (!buyerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    const [totalTasks, pendingSlotsAgg, totalPaidAgg] = await Promise.all([
      Task.countDocuments({ buyerEmail }),
      Task.aggregate([
        { $match: { buyerEmail } },
        { $group: { _id: null, pendingSlots: { $sum: '$requiredWorkers' } } },
      ]),
      Payment.aggregate([
        { $match: { buyerEmail, status: 'success' } },
        { $group: { _id: null, totalPaid: { $sum: '$amountUSD' } } },
      ]),
    ])

    const pendingSlots = pendingSlotsAgg?.[0]?.pendingSlots ?? 0
    const totalPaid = totalPaidAgg?.[0]?.totalPaid ?? 0

    res.json({
      success: true,
      summary: { totalTasks, pendingSlots, totalPaid },
    })
  } catch (err) {
    next(err)
  }
}

export async function getWorkerSummary(req, res, next) {
  try {
    const workerEmail = req.user?.email;
    if (!workerEmail) return res.status(401).json({ success: false, message: "Unauthorized" });

    const [totalSubmissions, pendingSubmissions, earningAgg] = await Promise.all([
      Submission.countDocuments({ workerEmail }),
      Submission.countDocuments({ workerEmail, status: "pending" }),
      Submission.aggregate([
        { $match: { workerEmail, status: "approved" } },
        { $group: { _id: null, totalEarning: { $sum: "$payableAmount" } } },
      ]),
    ]);

    const totalEarning = earningAgg?.[0]?.totalEarning ?? 0;

    res.json({
      success: true,
      summary: { totalSubmissions, pendingSubmissions, totalEarning },
    });
  } catch (err) {
    next(err);
  }
}
