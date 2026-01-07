import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
    },
    photoURL: { type: String, trim: true, default: '' },

    role: {
      type: String,
      enum: ['worker', 'buyer', 'admin'],
      default: 'worker',
      required: true,
    },

    coins: { type: Number, default: 0, min: 0 },

    // helps ensure "users will only get the coin on registration"
    signupBonusApplied: { type: Boolean, default: false },
  },
  { timestamps: true }
)

userSchema.index({ email: 1 }, { unique: true })

const User = mongoose.model('User', userSchema)
export default User
