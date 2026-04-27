// src/models/Category.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface ICategoryDocument extends Document {
  name: string
  slug: string
  description?: string
  parentId?: mongoose.Types.ObjectId
  type: 'theme' | 'plugin' | 'course' | 'file' | 'service_project' | 'service_recurring' | 'blog'
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
    type: {
      type: String,
      required: true,
      enum: ['theme', 'plugin', 'course', 'file', 'service_project', 'service_recurring', 'blog'],
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

CategorySchema.index({ type: 1, isActive: 1 })
CategorySchema.index({ slug: 1, type: 1 }, { unique: true })

export default mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema)
