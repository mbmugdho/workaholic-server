import mongoose from 'mongoose'
import Submission from '../models/Submission.js'
import User from '../models/User.js'
import Task from '../models/Task.js'

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
