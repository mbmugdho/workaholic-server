import mongoose from 'mongoose'
import Task from '../models/Task.js'
import User from '../models/User.js'
import { requireFields } from '../utils/validators.js'

export async function createTask(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const buyerEmail = req.user?.email
    if (!buyerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    requireFields(req.body, [
      'taskTitle',
      'taskDetail',
      'requiredWorkers',
      'payableAmount',
      'completionDate',
      'submissionInfo',
      'taskImageUrl',
      'buyerName',
    ])

    const requiredWorkers = Number(req.body.requiredWorkers)
    const payableAmount = Number(req.body.payableAmount)

    if (!Number.isFinite(requiredWorkers) || requiredWorkers <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'requiredWorkers must be a positive number',
        })
    }
    if (!Number.isFinite(payableAmount) || payableAmount <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'payableAmount must be a positive number',
        })
    }

    const completionDate = new Date(req.body.completionDate)
    if (Number.isNaN(completionDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid completionDate' })
    }

    const totalPayable = requiredWorkers * payableAmount

    session.startTransaction()

    const buyer = await User.findOne({ email: buyerEmail }).session(session)
    if (!buyer)
      return res
        .status(404)
        .json({ success: false, message: 'Buyer not found' })
    if (buyer.role !== 'buyer')
      return res
        .status(403)
        .json({ success: false, message: 'Buyer access required' })

    if (buyer.coins < totalPayable) {
      return res.status(400).json({
        success: false,
        message: 'Not enough coins. Purchase coins to add this task.',
        code: 'INSUFFICIENT_COINS',
        requiredCoins: totalPayable,
        availableCoins: buyer.coins,
      })
    }

    const task = await Task.create(
      [
        {
          buyerEmail,
          buyerName: req.body.buyerName,
          taskTitle: req.body.taskTitle,
          taskDetail: req.body.taskDetail,
          requiredWorkers,
          payableAmount,
          totalPayable,
          completionDate,
          submissionInfo: req.body.submissionInfo,
          taskImageUrl: req.body.taskImageUrl,
        },
      ],
      { session }
    )

    buyer.coins -= totalPayable
    await buyer.save({ session })

    await session.commitTransaction()

    return res
      .status(201)
      .json({ success: true, task: task[0], buyerCoins: buyer.coins })
  } catch (err) {
    await session.abortTransaction()
    next(err)
  } finally {
    session.endSession()
  }
}

export async function getMyTasks(req, res, next) {
  try {
    const buyerEmail = req.user?.email
    if (!buyerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    const tasks = await Task.find({ buyerEmail }).sort({
      completionDate: -1,
      createdAt: -1,
    })
    res.json({ success: true, tasks })
  } catch (err) {
    next(err)
  }
}

export async function updateMyTask(req, res, next) {
  try {
    const buyerEmail = req.user?.email
    if (!buyerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    const { id } = req.params

    const allowed = ['taskTitle', 'taskDetail', 'submissionInfo']
    const updates = {}
    for (const key of allowed) {
      if (req.body?.[key] !== undefined) updates[key] = req.body[key]
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, buyerEmail },
      { $set: updates },
      { new: true }
    )

    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found' })

    res.json({ success: true, task })
  } catch (err) {
    next(err)
  }
}

export async function deleteMyTask(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const buyerEmail = req.user?.email
    if (!buyerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    const { id } = req.params

    session.startTransaction()

    const task = await Task.findOne({ _id: id, buyerEmail }).session(session)
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found' })

    // Refund remaining slots only (requiredWorkers represents remaining slots)
    const refundCoins =
      Number(task.requiredWorkers) * Number(task.payableAmount)

    await Task.deleteOne({ _id: id }).session(session)

    const buyer = await User.findOneAndUpdate(
      { email: buyerEmail, role: 'buyer' },
      { $inc: { coins: refundCoins } },
      { new: true, session }
    )

    await session.commitTransaction()

    res.json({ success: true, refundCoins, buyerCoins: buyer?.coins ?? null })
  } catch (err) {
    await session.abortTransaction()
    next(err)
  } finally {
    session.endSession()
  }
}
