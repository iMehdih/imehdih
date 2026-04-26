// src/models/Domain.ts
// دامنه‌هایی که مشتری برای قالب/افزونه‌ها ثبت می‌کنه
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDomainDocument extends Document {
  userId: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId      // سفارش مرتبط
  productId: mongoose.Types.ObjectId    // قالب یا افزونه
  domain: string                        // آدرس دامنه
  changeCount: number                   // تعداد دفعات تغییر (max 3)
  createdAt: Date
  updatedAt: Date
}

const DomainSchema = new Schema<IDomainDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  domain: { type: String, required: true },
  changeCount: { type: Number, default: 0 },
}, { timestamps: true })

DomainSchema.index({ userId: 1, productId: 1 })

const Domain: Model<IDomainDocument> =
  mongoose.models.Domain || mongoose.model<IDomainDocument>('Domain', DomainSchema)

export default Domain
