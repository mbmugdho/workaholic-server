import mongoose from 'mongoose'
import Payment from '../models/Payment.js'
import User from '../models/User.js'
import { isValidCoinPackage } from '../utils/helpers.js'
import { requireFields } from '../utils/validators.js'

export async function createDummyPayment(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const buyerEmail = req.user?.email
    if (!buyerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    requireFields(req.body, ['coins', 'amountUSD'])

    const coins = Number(req.body.coins)
    const amountUSD = Number(req.body.amountUSD)

    if (!Number.isFinite(coins) || coins <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'coins must be a positive number' })
    }
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'amountUSD must be a positive number',
        })
    }

    // Prevent cheating: only allow fixed packages
    if (!isValidCoinPackage(coins, amountUSD)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coin package',
      })
    }

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

    const payment = await Payment.create(
      [
        {
          buyerEmail,
          buyerName: buyer.displayName || '',
          coins,
          amountUSD,
          provider: 'dummy',
          status: 'success',
          paidAt: new Date(),
        },
      ],
      { session }
    )

    buyer.coins += coins
    await buyer.save({ session })

    await session.commitTransaction()

    res.status(201).json({
      success: true,
      payment: payment[0],
      buyerCoins: buyer.coins,
    })
  } catch (err) {
    await session.abortTransaction()
    next(err)
  } finally {
    session.endSession()
  }
}

export async function getMyPayments(req, res, next) {
  try {
    const buyerEmail = req.user?.email
    if (!buyerEmail)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    const payments = await Payment.find({ buyerEmail }).sort({ createdAt: -1 })
    res.json({ success: true, payments })
  } catch (err) {
    next(err)
  }
}
