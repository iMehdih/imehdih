import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IServiceTemplateDocument extends Document {
  productId: mongoose.Types.ObjectId
  productType: string
  title: string
  tasks: {
    _id: mongoose.Types.ObjectId
    title: string
    description: string
    order: number
    isRequired: boolean
    isBlocking: boolean
    recurringType?: 'weekly' | 'monthly' | 'custom'
    recurringInterval?: number
    recurringDayOfMonth?: number
    recurringDayOfWeek?: number
    fields: {
      name: string
      label: string
      type: 'text' | 'number' | 'image' | 'file' | 'url' | 'textarea' | 'select'
      required: boolean
      options?: string[]
      usedInReport: boolean
      reportLabel?: string
    }[]
  }[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ServiceTemplateSchema = new Schema<IServiceTemplateDocument>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  productType: String,
  title: { type: String, required: true },
  tasks: [{
    title: String,
    description: String,
    order: Number,
    isRequired: { type: Boolean, default: true },
    isBlocking: { type: Boolean, default: false },
    recurringType: { type: String, enum: ['weekly', 'monthly', 'custom'] },
    recurringInterval: Number,
    recurringDayOfMonth: Number,
    recurringDayOfWeek: Number,
    fields: [{
      name: String,
      label: String,
      type: { type: String, enum: ['text', 'number', 'image', 'file', 'url', 'textarea', 'select'] },
      required: { type: Boolean, default: false },
      options: [String],
      usedInReport: { type: Boolean, default: false },
      reportLabel: String,
    }],
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const ServiceTemplate: Model<IServiceTemplateDocument> =
  mongoose.models.ServiceTemplate || mongoose.model<IServiceTemplateDocument>('ServiceTemplate', ServiceTemplateSchema)

export default ServiceTemplate
