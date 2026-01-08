import mongoose from 'mongoose'
import User from '../models/User.js'
import Task from '../models/Task.js'
import Payment from '../models/Payment.js'
import Withdrawal from '../models/Withdrawal.js'

export async function getAdminSummary(req, res, next) {
  try {
    const [totalWorkers, totalBuyers, totalPaymentsAgg, totalCoinsAgg] =
      await Promise.all([
        User.countDocuments({ role: 'worker' }),
        User.countDocuments({ role: 'buyer' }),
        Payment.aggregate([
          { $match: { status: 'success' } },
          { $group: { _id: null, totalPayments: { $sum: '$amountUSD' } } },
        ]),
        User.aggregate([
          { $group: { _id: null, totalCoins: { $sum: '$coins' } } },
        ]),
      ])

    res.json({
      success: true,
      summary: {
        totalWorkers,
        totalBuyers,
        totalPayments: totalPaymentsAgg?.[0]?.totalPayments ?? 0,
        totalAvailableCoins: totalCoinsAgg?.[0]?.totalCoins ?? 0,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getPendingWithdrawals(req, res, next) {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' }).sort({
      createdAt: -1,
    })
    res.json({ success: true, withdrawals })
  } catch (err) {
    next(err)
  }
}

export async function approveWithdrawal(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const { id } = req.params

    session.startTransaction()

    const withdrawal = await Withdrawal.findById(id).session(session)
    if (!withdrawal) {
      return res
        .status(404)
        .json({ success: false, message: 'Withdrawal not found' })
    }

    if (withdrawal.status !== 'pending') {
      return res
        .status(400)
        .json({ success: false, message: 'Withdrawal already processed' })
    }

    const worker = await User.findOne({
      email: withdrawal.workerEmail,
      role: 'worker',
    }).session(session)

    if (!worker) {
      return res
        .status(404)
        .json({ success: false, message: 'Worker not found' })
    }

    // Decrease worker coins by withdrawalCoin
    if (worker.coins < withdrawal.withdrawalCoin) {
      return res.status(400).json({
        success: false,
        message: 'Worker does not have enough coins for this withdrawal',
      })
    }

    worker.coins -= withdrawal.withdrawalCoin
    await worker.save({ session })

    withdrawal.status = 'approved'
    withdrawal.processedAt = new Date()
    await withdrawal.save({ session })

    await session.commitTransaction()

    res.json({
      success: true,
      withdrawal,
      workerCoins: worker.coins,
    })
  } catch (err) {
    await session.abortTransaction()
    next(err)
  } finally {
    session.endSession()
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('displayName email photoURL role coins createdAt')
    res.json({ success: true, users })
  } catch (err) {
    next(err)
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params
    const role = String(req.body?.role || '').toLowerCase()

    if (!['admin', 'buyer', 'worker'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true }
    ).select('displayName email photoURL role coins')

    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' })

    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params

    const user = await User.findByIdAndDelete(id)
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' })

    res.json({ success: true, message: 'User removed' })
  } catch (err) {
    next(err)
  }
}

export async function getAllTasks(req, res, next) {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 })
    res.json({ success: true, tasks })
  } catch (err) {
    next(err)
  }
}

export async function deleteTaskAdmin(req, res, next) {
  try {
    const { id } = req.params

    const task = await Task.findByIdAndDelete(id)
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found' })

    res.json({ success: true, message: 'Task deleted' })
  } catch (err) {
    next(err)
  }
}
