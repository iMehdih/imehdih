// src/models/Review.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IReviewDocument extends Document {
  productId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  rating: number // 1-5
  title?: string
  body: string
  isVerifiedPurchase: boolean
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 100 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
)

ReviewSchema.index({ productId: 1, isApproved: 1 })
ReviewSchema.index({ userId: 1 })
// one review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true })

export default mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema)
