import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserDocument extends Document {
  mobile: string
  role: 'customer' | 'staff' | 'admin'
  firstName?: string
  lastName?: string
  email?: string
  avatar?: string
  // حقوقی
  isLegal: boolean
  companyName?: string
  nationalId?: string
  economicCode?: string
  registrationNumber?: string
  // اعلان‌ها
  emailNotifications: {
    orderConfirm: boolean
    ticketReply: boolean
    hostingRenewal: boolean
    internalMessages: boolean
    reviewReminder: boolean
    newsletter: boolean
  }
  // وضعیت
  isActive: boolean
  isProfileComplete: boolean
  customerScore: number
  isVIP: boolean
  lastSeen: Date
  // مالی (برای کارمند)
  salary?: number
  walletBalance?: number
  rating?: number
  totalTasksCompleted?: number
  departments?: string[]
  // OTP
  otp?: string
  otpExpires?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUserDocument>({
  mobile: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  firstName: String,
  lastName: String,
  email: { type: String, sparse: true },
  avatar: String,
  isLegal: { type: Boolean, default: false },
  companyName: String,
  nationalId: String,
  economicCode: String,
  registrationNumber: String,
  emailNotifications: {
    orderConfirm: { type: Boolean, default: true },
    ticketReply: { type: Boolean, default: true },
    hostingRenewal: { type: Boolean, default: true },
    internalMessages: { type: Boolean, default: false },
    reviewReminder: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true },
  isProfileComplete: { type: Boolean, default: false },
  customerScore: { type: Number, default: 0 },
  isVIP: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  // staff fields
  salary: Number,
  walletBalance: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  totalTasksCompleted: { type: Number, default: 0 },
  departments: [String],
  // OTP
  otp: String,
  otpExpires: Date,
}, { timestamps: true })

UserSchema.index({ role: 1, isActive: 1 })
UserSchema.index({ customerScore: -1 })

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema)

export default User
