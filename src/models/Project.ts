import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProjectDocument extends Document {
  type: 'customer' | 'internal'
  orderId?: mongoose.Types.ObjectId
  customerId?: mongoose.Types.ObjectId
  assignedTo?: mongoose.Types.ObjectId
  templateId: mongoose.Types.ObjectId
  title: string
  status: 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  isSpecificStaff: boolean
  specificStaffId?: mongoose.Types.ObjectId
  tasks: {
    _id: mongoose.Types.ObjectId
    templateTaskId: mongoose.Types.ObjectId
    title: string
    status: 'pending' | 'unlocked' | 'in_progress' | 'completed'
    assignedTo?: mongoose.Types.ObjectId
    fieldValues: Record<string, unknown>
    fields?: { name: string; label: string; type: string; required?: boolean; usedInReport?: boolean; reportLabel?: string }[]
    isBlocking?: boolean
    isRequired?: boolean
    recurringType?: string
    recurringInterval?: number
    recurringDayOfMonth?: number
    recurringDayOfWeek?: number
    order?: number
    startedAt?: Date
    completedAt?: Date
    timeSpentMinutes: number
  }[]
  commissionRate: number
  isCommissionPaid: boolean
  adminRating?: number
  adminNote?: string
  reportGenerated: boolean
  reportData?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProjectDocument>({
  type: { type: String, enum: ['customer', 'internal'], default: 'customer' },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  customerId: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  templateId: { type: Schema.Types.ObjectId, ref: 'ServiceTemplate' },
  title: { type: String, required: true },
  status: { type: String, enum: ['available', 'assigned', 'in_progress', 'completed', 'cancelled'], default: 'available' },
  isSpecificStaff: { type: Boolean, default: false },
  specificStaffId: { type: Schema.Types.ObjectId, ref: 'User' },
  tasks: [{
    templateTaskId: { type: Schema.Types.ObjectId },
    title: String,
    status: { type: String, default: 'pending' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    fieldValues: { type: Schema.Types.Mixed, default: {} },
    fields: { type: Schema.Types.Mixed },
    isBlocking: Boolean,
    isRequired: Boolean,
    recurringType: String,
    recurringInterval: Number,
    recurringDayOfMonth: Number,
    recurringDayOfWeek: Number,
    order: Number,
    startedAt: Date,
    completedAt: Date,
    timeSpentMinutes: { type: Number, default: 0 },
  }],
  commissionRate: { type: Number, default: 0 },
  isCommissionPaid: { type: Boolean, default: false },
  adminRating: Number,
  adminNote: String,
  reportGenerated: { type: Boolean, default: false },
  reportData: Schema.Types.Mixed,
}, { timestamps: true })

ProjectSchema.index({ status: 1, type: 1 })
ProjectSchema.index({ assignedTo: 1, status: 1 })
ProjectSchema.index({ customerId: 1 })

const Project: Model<IProjectDocument> =
  mongoose.models.Project || mongoose.model<IProjectDocument>('Project', ProjectSchema)

export default Project
