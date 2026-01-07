import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    toEmail: { type: String, trim: true, lowercase: true, required: true },
    message: { type: String, trim: true, required: true },
    actionRoute: { type: String, trim: true, required: true },

    time: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

notificationSchema.index({ toEmail: 1, time: -1 })

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
