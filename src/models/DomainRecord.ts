// src/models/DomainRecord.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDomainRecordDocument extends Document {
  userId: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  domain: string
  tld: string          // ir / com / net / ...
  registrar: 'farasoo' | 'iransrv'
  registrarRef?: string
  expiresAt: Date
  status: 'active' | 'expired' | 'pending' | 'failed'
  autoRenew: boolean
  nameservers: string[]
  lastWarningAt?: Date
  createdAt: Date
  updatedAt: Date
}

const DomainRecordSchema = new Schema<IDomainRecordDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  domain: { type: String, required: true, unique: true },
  tld: { type: String, required: true },
  registrar: { type: String, enum: ['farasoo','iransrv'], required: true },
  registrarRef: String,
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['active','expired','pending','failed'], default: 'pending' },
  autoRenew: { type: Boolean, default: false },
  nameservers: [String],
  lastWarningAt: Date,
}, { timestamps: true })

DomainRecordSchema.index({ userId: 1, status: 1 })
DomainRecordSchema.index({ expiresAt: 1, status: 1 })

const DomainRecord: Model<IDomainRecordDocument> =
  mongoose.models.DomainRecord || mongoose.model<IDomainRecordDocument>('DomainRecord', DomainRecordSchema)

export default DomainRecord
