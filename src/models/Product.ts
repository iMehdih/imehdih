import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProductDocument extends Document {
  type: 'theme' | 'plugin' | 'course' | 'file' | 'service_project' | 'service_recurring' | 'hosting' | 'domain' | 'subscription_pro'
  title: string
  slug: string
  description: string
  shortDescription: string
  price: number
  salePrice?: number
  isActive: boolean
  isFeatured: boolean
  images: string[]
  thumbnail: string
  // دسته‌بندی
  category: string
  tags: string[]
  // ویژگی‌ها (بر اساس نوع محصول)
  meta: Record<string, unknown>
  // پشتیبانی
  supportDuration?: number // روز
  // دانلود
  downloadFile?: string
  downloadCount: number
  // امتیاز
  rating: number
  reviewCount: number
  // سئو
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProductDocument>({
  type: { type: String, required: true, enum: ['theme', 'plugin', 'course', 'file', 'service_project', 'service_recurring', 'hosting', 'domain', 'subscription_pro'] },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  price: { type: Number, required: true },
  salePrice: Number,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  images: [String],
  thumbnail: { type: String, default: '' },
  category: String,
  tags: [String],
  meta: { type: Schema.Types.Mixed, default: {} },
  supportDuration: Number,
  downloadFile: String,
  downloadCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  seoTitle: String,
  seoDescription: String,
}, { timestamps: true })

ProductSchema.index({ type: 1, isActive: 1 })
ProductSchema.index({ slug: 1 })
ProductSchema.index({ rating: -1 })

const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema)

export default Product
