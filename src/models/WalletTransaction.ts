// src/models/WalletTransaction.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IWalletTransactionDocument extends Document {
  staffId: mongoose.Types.ObjectId
  type: 'salary' | 'commission' | 'bonus' | 'withdrawal'
  amount: number
  description: string
  status: 'pending' | 'paid' | 'rejected'
  paidAt?: Date
  createdAt: Date
}

const WalletTransactionSchema = new Schema<IWalletTransactionDocument>({
  staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['salary','commission','bonus','withdrawal'], required: true },
  amount: { type: Number, required: true },
  description: String,
  status: { type: String, enum: ['pending','paid','rejected'], default: 'pending' },
  paidAt: Date,
}, { timestamps: true })

WalletTransactionSchema.index({ staffId: 1, createdAt: -1 })

const WalletTransaction: Model<IWalletTransactionDocument> =
  mongoose.models.WalletTransaction || mongoose.model<IWalletTransactionDocument>('WalletTransaction', WalletTransactionSchema)

export default WalletTransaction
