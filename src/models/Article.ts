// src/models/Article.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IArticleDocument extends Document {
  title: string
  slug: string
  excerpt?: string
  content: string
  thumbnail?: string
  authorId: mongoose.Types.ObjectId
  categoryId?: mongoose.Types.ObjectId
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  isFeatured: boolean
  viewCount: number
  readTime: number
  publishedAt?: Date
  seo?: {
    title?: string
    description?: string
    keywords?: string
  }
  createdAt: Date
  updatedAt: Date
}

const ArticleSchema = new Schema<IArticleDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    thumbnail: { type: String, trim: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    readTime: { type: Number, default: 1 },
    publishedAt: { type: Date },
    seo: {
      title: String,
      description: String,
      keywords: String,
    },
  },
  { timestamps: true }
)

ArticleSchema.index({ status: 1, publishedAt: -1 })
ArticleSchema.index({ authorId: 1 })
ArticleSchema.index({ categoryId: 1 })

export default mongoose.models.Article || mongoose.model<IArticleDocument>('Article', ArticleSchema)
