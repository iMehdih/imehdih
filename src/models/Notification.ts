import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  content: string
  isRead: boolean
  type: 'system' | 'order' | 'ticket' | 'project' | 'payment' | 'broadcast'
  relatedId?: mongoose.Types.ObjectId
  relatedModel?: string
  createdAt: Date
}

const NotificationSchema = new Schema<INotificationDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: { type: String, enum: ['system', 'order', 'ticket', 'project', 'payment', 'broadcast'], default: 'system' },
  relatedId: { type: Schema.Types.ObjectId },
  relatedModel: String,
}, { timestamps: true })

NotificationSchema.index({ userId: 1, isRead: 1 })
NotificationSchema.index({ createdAt: -1 })

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema)

export default Notification
