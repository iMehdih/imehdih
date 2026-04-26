// src/models/Expense.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IExpenseDocument extends Document {
  title: string
  amount: number
  category: 'salary' | 'bonus' | 'infrastructure' | 'marketing' | 'tools' | 'tax' | 'other'
  type: 'auto' | 'manual' | 'offline'
  relatedUserId?: mongoose.Types.ObjectId
  description?: string
  receiptUrl?: string
  date: Date
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
}

const ExpenseSchema = new Schema<IExpenseDocument>({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['salary','bonus','infrastructure','marketing','tools','tax','other'], required: true },
  type: { type: String, enum: ['auto','manual','offline'], default: 'manual' },
  relatedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  description: String,
  receiptUrl: String,
  date: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

ExpenseSchema.index({ date: -1 })
ExpenseSchema.index({ category: 1, date: -1 })

const Expense: Model<IExpenseDocument> =
  mongoose.models.Expense || mongoose.model<IExpenseDocument>('Expense', ExpenseSchema)

export default Expense
