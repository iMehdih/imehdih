import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAuditLogDocument extends Document {
  userId: mongoose.Types.ObjectId
  userRole: string
  action: string
  entity: string
  entityId?: mongoose.Types.ObjectId
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  ip?: string
  userAgent?: string
  createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLogDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: String,
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: Schema.Types.ObjectId,
  before: Schema.Types.Mixed,
  after: Schema.Types.Mixed,
  ip: String,
  userAgent: String,
}, { timestamps: true })

AuditLogSchema.index({ userId: 1, createdAt: -1 })
AuditLogSchema.index({ entity: 1, entityId: 1 })

const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema)

export default AuditLog
