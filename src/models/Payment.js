import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    buyerEmail: { type: String, trim: true, lowercase: true, required: true },
    buyerName: { type: String, trim: true, default: '' },

    coins: { type: Number, required: true, min: 0 },
    amountUSD: { type: Number, required: true, min: 0 },

    provider: { type: String, enum: ['dummy', 'stripe'], default: 'dummy' },
    transactionId: { type: String, trim: true, default: '' },

    status: { type: String, enum: ['success', 'failed'], default: 'success' },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

paymentSchema.index({ buyerEmail: 1, createdAt: -1 })

const Payment = mongoose.model('Payment', paymentSchema)
export default Payment
