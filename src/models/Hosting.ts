// src/models/Hosting.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IHostingDocument extends Document {
  userId: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  plan: string
  domain: string
  username: string
  password: string
  serverIp?: string
  expiresAt: Date
  status: 'active' | 'suspended' | 'deleted' | 'pending'
  autoRenew: boolean
  lastWarningAt?: Date
  suspendedAt?: Date
  providerRef?: string
  createdAt: Date
  updatedAt: Date
}

const HostingSchema = new Schema<IHostingDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  plan: { type: String, required: true },
  domain: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  serverIp: String,
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['active','suspended','deleted','pending'], default: 'pending' },
  autoRenew: { type: Boolean, default: false },
  lastWarningAt: Date,
  suspendedAt: Date,
  providerRef: String,
}, { timestamps: true })

HostingSchema.index({ userId: 1, status: 1 })
HostingSchema.index({ expiresAt: 1, status: 1 })

const Hosting: Model<IHostingDocument> =
  mongoose.models.Hosting || mongoose.model<IHostingDocument>('Hosting', HostingSchema)

export default Hosting
