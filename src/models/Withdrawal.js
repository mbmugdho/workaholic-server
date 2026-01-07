import mongoose from 'mongoose'

const withdrawalSchema = new mongoose.Schema(
  {
    workerEmail: { type: String, trim: true, lowercase: true, required: true },
    workerName: { type: String, trim: true, required: true },

    withdrawalCoin: { type: Number, required: true, min: 1 },
    withdrawalAmountUSD: { type: Number, required: true, min: 0 },

    paymentSystem: { type: String, trim: true, required: true },
    accountNumber: { type: String, trim: true, required: true },

    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },

    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

withdrawalSchema.index({ status: 1, createdAt: -1 })
withdrawalSchema.index({ workerEmail: 1, createdAt: -1 })

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema)
export default Withdrawal
