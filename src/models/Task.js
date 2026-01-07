import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    buyerEmail: { type: String, trim: true, lowercase: true, required: true },
    buyerName: { type: String, trim: true, required: true },

    taskTitle: { type: String, trim: true, required: true },
    taskDetail: { type: String, trim: true, required: true },

    requiredWorkers: { type: Number, required: true, min: 0 },
    payableAmount: { type: Number, required: true, min: 0 },

    totalPayable: { type: Number, required: true, min: 0 },

    completionDate: { type: Date, required: true },
    submissionInfo: { type: String, trim: true, required: true },

    taskImageUrl: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

taskSchema.index({ buyerEmail: 1 })
taskSchema.index({ requiredWorkers: 1 })
taskSchema.index({ completionDate: -1 })

const Task = mongoose.model('Task', taskSchema)
export default Task
