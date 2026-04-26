import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOrderDocument extends Document {
  orderNumber: string
  userId: mongoose.Types.ObjectId
  items: {
    productId: mongoose.Types.ObjectId
    productType: string
    title: string
    price: number
    discountedPrice: number
    meta?: Record<string, unknown>
  }[]
  subtotal: number
  discountAmount: number
  couponCode?: string
  couponDiscount: number
  finalAmount: number
  status: 'pending_payment' | 'paid' | 'in_progress' | 'completed' | 'cancelled' | 'refunded'
  paymentRef?: string
  paymentGateway: string
  paidAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrderDocument>({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productType: String,
    title: String,
    price: Number,
    discountedPrice: Number,
    meta: Schema.Types.Mixed,
  }],
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponCode: String,
  couponDiscount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending_payment', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded'], default: 'pending_payment' },
  paymentRef: String,
  paymentGateway: { type: String, default: 'zarinpal' },
  paidAt: Date,
  notes: String,
}, { timestamps: true })

OrderSchema.index({ userId: 1, status: 1 })
// orderNumber index is handled by unique: true above — no duplicate
OrderSchema.index({ createdAt: -1 })

const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema)

export default Order
