// src/models/Coupon.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICouponDocument extends Document {
  code: string
  type: 'percent' | 'fixed'
  value: number
  maxDiscount?: number        // سقف تخفیف برای percent
  minOrderAmount?: number     // حداقل مبلغ سبد
  maxUses?: number            // حداکثر استفاده کل
  usedCount: number
  maxUsesPerUser: number      // حداکثر per user
  specificUserId?: mongoose.Types.ObjectId  // فقط برای یه کاربر
  applicableTo: 'all' | 'product' | 'category' | 'first_order'
  applicableIds?: mongoose.Types.ObjectId[]
  applicableCategories?: string[]
  startsAt?: Date
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
}

const CouponSchema = new Schema<ICouponDocument>({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percent', 'fixed'], required: true },
  value: { type: Number, required: true },
  maxDiscount: Number,
  minOrderAmount: Number,
  maxUses: Number,
  usedCount: { type: Number, default: 0 },
  maxUsesPerUser: { type: Number, default: 1 },
  specificUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  applicableTo: { type: String, enum: ['all', 'product', 'category', 'first_order'], default: 'all' },
  applicableIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [String],
  startsAt: Date,
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const Coupon: Model<ICouponDocument> =
  mongoose.models.Coupon || mongoose.model<ICouponDocument>('Coupon', CouponSchema)

export default Coupon