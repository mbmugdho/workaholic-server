import mongoose from 'mongoose'
import Submission from '../models/Submission.js'
import User from '../models/User.js'
import Task from '../models/Task.js'
import { requireFields } from "../utils/validators.js";


export async function getBuyerPendingSubmissions(req, res, next) {
  try {
    const buyerEmail = req.user?.email
    if (!buyerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    const submissions = await Submission.find({
      buyerEmail,
      status: 'pending',
    }).sort({ createdAt: -1 })

    res.json({ success: true, submissions })
  } catch (err) {
    next(err)
  }
}

export async function approveSubmission(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const buyerEmail = req.user?.email
    if (!buyerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    const { id } = req.params

    session.startTransaction()

    const submission = await Submission.findOne({
      _id: id,
      buyerEmail,
    }).session(session)
    if (!submission)
      return res
        .status(404)
        .json({ success: false, message: 'Submission not found' })

    if (submission.status !== 'pending') {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Only pending submissions can be approved',
        })
    }

    submission.status = 'approved'
    await submission.save({ session })

    const worker = await User.findOneAndUpdate(
      { email: submission.workerEmail, role: 'worker' },
      { $inc: { coins: submission.payableAmount } },
      { new: true, session }
    )

    await session.commitTransaction()

    res.json({
      success: true,
      submission,
      workerCoins: worker?.coins ?? null,
    })
  } catch (err) {
    await session.abortTransaction()
    next(err)
  } finally {
    session.endSession()
  }
}

export async function rejectSubmission(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const buyerEmail = req.user?.email
    if (!buyerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    const { id } = req.params

    session.startTransaction()

    const submission = await Submission.findOne({
      _id: id,
      buyerEmail,
    }).session(session)
    if (!submission)
      return res
        .status(404)
        .json({ success: false, message: 'Submission not found' })

    if (submission.status !== 'pending') {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Only pending submissions can be rejected',
        })
    }

    submission.status = 'rejected'
    await submission.save({ session })

    // Business rule: rejection re-opens a worker slot
    await Task.updateOne(
      { _id: submission.taskId },
      { $inc: { requiredWorkers: 1 } }
    ).session(session)

    await session.commitTransaction()

    res.json({ success: true, submission })
  } catch (err) {
    await session.abortTransaction()
    next(err)
  } finally {
    session.endSession()
  }
}

// Worker: create submission (decrement requiredWorkers)
export async function createWorkerSubmission(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const workerEmail = req.user?.email;
    if (!workerEmail) return res.status(401).json({ success: false, message: "Unauthorized" });

    requireFields(req.body, ["taskId", "submissionDetails"]);

    session.startTransaction();

    const worker = await User.findOne({ email: workerEmail, role: "worker" }).session(session);
    if (!worker) return res.status(403).json({ success: false, message: "Worker access required" });

    const task = await Task.findById(req.body.taskId).session(session);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Expired or full
    if (new Date(task.completionDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Task deadline has passed" });
    }
    if (task.requiredWorkers <= 0) {
      return res.status(400).json({ success: false, message: "No worker slots available" });
    }

    // Prevent duplicate submissions by same worker for same task
    const existing = await Submission.findOne({
      taskId: task._id,
      workerEmail,
    }).session(session);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted for this task.",
      });
    }

    // Reserve slot
    task.requiredWorkers -= 1;
    await task.save({ session });

    const submission = await Submission.create(
      [
        {
          taskId: task._id,
          taskTitle: task.taskTitle,
          payableAmount: task.payableAmount,

          workerEmail,
          workerName: worker.displayName,

          buyerName: task.buyerName,
          buyerEmail: task.buyerEmail,

          submissionDetails: req.body.submissionDetails,
          status: "pending",
          submittedAt: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({ success: true, submission: submission[0] });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
}

// Worker: my submissions with pagination
export async function getWorkerMySubmissions(req, res, next) {
  try {
    const workerEmail = req.user?.email;
    if (!workerEmail) return res.status(401).json({ success: false, message: "Unauthorized" });

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Submission.find({ workerEmail })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Submission.countDocuments({ workerEmail }),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.json({
      success: true,
      submissions: items,
      pagination: { page, limit, total, totalPages },
    });
  } catch (err) {
    next(err);
  }
}

// Worker: approved submissions list
export async function getWorkerApprovedSubmissions(req, res, next) {
  try {
    const workerEmail = req.user?.email;
    if (!workerEmail) return res.status(401).json({ success: false, message: "Unauthorized" });

    const submissions = await Submission.find({
      workerEmail,
      status: "approved",
    }).sort({ createdAt: -1 });

    res.json({ success: true, submissions });
  } catch (err) {
    next(err);
  }
}
