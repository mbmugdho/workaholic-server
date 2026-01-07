import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },

    taskTitle: { type: String, trim: true, required: true },
    payableAmount: { type: Number, required: true, min: 0 },

    workerEmail: { type: String, trim: true, lowercase: true, required: true },
    workerName: { type: String, trim: true, required: true },

    buyerEmail: { type: String, trim: true, lowercase: true, required: true },
    buyerName: { type: String, trim: true, required: true },

    submissionDetails: { type: String, trim: true, required: true },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

submissionSchema.index({ workerEmail: 1, createdAt: -1 })
submissionSchema.index({ buyerEmail: 1, status: 1 })
submissionSchema.index({ taskId: 1, createdAt: -1 })
submissionSchema.index({ buyerEmail: 1, status: 1, createdAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema)
export default Submission
