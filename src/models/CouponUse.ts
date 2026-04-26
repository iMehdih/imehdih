// src/models/CouponUse.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICouponUseDocument extends Document {
  couponId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  createdAt: Date
}

const CouponUseSchema = new Schema<ICouponUseDocument>({
  couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
}, { timestamps: true })

CouponUseSchema.index({ couponId: 1, userId: 1 })

const CouponUse: Model<ICouponUseDocument> =
  mongoose.models.CouponUse || mongoose.model<ICouponUseDocument>('CouponUse', CouponUseSchema)

export default CouponUse