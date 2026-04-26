import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITicketDocument extends Document {
  ticketNumber: string
  userId: mongoose.Types.ObjectId
  department: 'support_theme_plugin' | 'support_course' | 'support_hosting_domain' | 'support_service' | 'support_subscription' | 'finance' | 'service_support' | 'presale' | 'management'
  relatedProductId?: mongoose.Types.ObjectId
  relatedProductType?: string
  relatedDomain?: string
  relatedHostingId?: mongoose.Types.ObjectId
  title: string
  status: 'open' | 'in_review' | 'waiting_info' | 'in_progress' | 'answered' | 'special_handling' | 'waiting_payment' | 'resolved_pending_confirm' | 'closed' | 'cancelled'
  assignedTo?: mongoose.Types.ObjectId
  messages: {
    _id: mongoose.Types.ObjectId
    senderId: mongoose.Types.ObjectId
    senderRole: string
    content: string
    attachments: string[]
    createdAt: Date
  }[]
  closedAt?: Date
  autoCloseAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TicketSchema = new Schema<ITicketDocument>({
  ticketNumber: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, required: true },
  relatedProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
  relatedProductType: String,
  relatedDomain: String,
  relatedHostingId: { type: Schema.Types.ObjectId },
  title: { type: String, required: true },
  status: { type: String, default: 'open' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  messages: [{
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    senderRole: String,
    content: String,
    attachments: [String],
    createdAt: { type: Date, default: Date.now },
  }],
  closedAt: Date,
  autoCloseAt: Date,
}, { timestamps: true })

TicketSchema.index({ userId: 1, status: 1 })
TicketSchema.index({ assignedTo: 1, status: 1 })
TicketSchema.index({ department: 1, status: 1 })

const Ticket: Model<ITicketDocument> =
  mongoose.models.Ticket || mongoose.model<ITicketDocument>('Ticket', TicketSchema)

export default Ticket
