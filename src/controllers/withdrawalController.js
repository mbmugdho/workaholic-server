import Withdrawal from '../models/Withdrawal.js'
import User from '../models/User.js'
import { coinsToUSD, MIN_WITHDRAW_COINS } from '../utils/helpers.js'
import { requireFields } from '../utils/validators.js'

export async function createWithdrawalRequest(req, res, next) {
  try {
    const workerEmail = req.user?.email
    if (!workerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    requireFields(req.body, [
      'withdrawalCoin',
      'paymentSystem',
      'accountNumber',
    ])

    const withdrawalCoin = Number(req.body.withdrawalCoin)
    if (!Number.isFinite(withdrawalCoin) || withdrawalCoin <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'withdrawalCoin must be a positive number',
        })
    }

    const worker = await User.findOne({ email: workerEmail, role: 'worker' })
    if (!worker)
      return res
        .status(403)
        .json({ success: false, message: 'Worker access required' })

    if (worker.coins < MIN_WITHDRAW_COINS) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${MIN_WITHDRAW_COINS} coins required to withdraw.`,
        code: 'MIN_WITHDRAW_NOT_MET',
      })
    }

    if (withdrawalCoin > worker.coins) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal coins cannot exceed your available coins.',
      })
    }

    const withdrawalAmountUSD = coinsToUSD(withdrawalCoin)

    const doc = await Withdrawal.create({
      workerEmail,
      workerName: worker.displayName,
      withdrawalCoin,
      withdrawalAmountUSD,
      paymentSystem: String(req.body.paymentSystem),
      accountNumber: String(req.body.accountNumber),
      status: 'pending',
      requestedAt: new Date(),
    })

    res.status(201).json({ success: true, withdrawal: doc })
  } catch (err) {
    next(err)
  }
}

export async function getMyWithdrawals(req, res, next) {
  try {
    const workerEmail = req.user?.email
    if (!workerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    const withdrawals = await Withdrawal.find({ workerEmail }).sort({
      createdAt: -1,
    })

    res.json({ success: true, withdrawals })
  } catch (err) {
    next(err)
  }
}
