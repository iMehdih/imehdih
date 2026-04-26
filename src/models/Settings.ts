import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISettingsDocument extends Document {
  key: string
  value: unknown
  group: 'general' | 'sms' | 'email' | 'payment' | 'brand' | 'support'
  label: string
  type: 'string' | 'number' | 'boolean' | 'json'
  isSecret: boolean
  updatedBy?: mongoose.Types.ObjectId
  updatedAt: Date
}

const SettingsSchema = new Schema<ISettingsDocument>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed },
  group: { type: String, enum: ['general', 'sms', 'email', 'payment', 'brand', 'support'], default: 'general' },
  label: { type: String, required: true },
  type: { type: String, enum: ['string', 'number', 'boolean', 'json'], default: 'string' },
  isSecret: { type: Boolean, default: false },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

const Settings: Model<ISettingsDocument> =
  mongoose.models.Settings || mongoose.model<ISettingsDocument>('Settings', SettingsSchema)

export default Settings

// Default settings map for initial seed
export const DEFAULT_SETTINGS = [
  // General
  { key: 'site_name', value: 'مهدی حاتم‌پور', group: 'general', label: 'نام سایت', type: 'string', isSecret: false },
  { key: 'site_tagline', value: 'مدیر آنلاین کسب‌وکار شما', group: 'general', label: 'شعار سایت', type: 'string', isSecret: false },
  { key: 'support_phone', value: '', group: 'general', label: 'شماره پشتیبانی', type: 'string', isSecret: false },
  { key: 'support_hours', value: 'شنبه تا چهارشنبه ۹ تا ۱۸', group: 'general', label: 'ساعات پشتیبانی', type: 'string', isSecret: false },
  // Brand
  { key: 'brand_color_gold', value: '#C8A96E', group: 'brand', label: 'رنگ طلایی', type: 'string', isSecret: false },
  { key: 'brand_logo_url', value: '', group: 'brand', label: 'لوگو (URL)', type: 'string', isSecret: false },
  { key: 'brand_favicon_url', value: '', group: 'brand', label: 'Favicon (URL)', type: 'string', isSecret: false },
  // Payment
  { key: 'invoice_company_name', value: 'مهدی حاتم‌پور', group: 'payment', label: 'نام صادرکننده فاکتور', type: 'string', isSecret: false },
  { key: 'invoice_tax_id', value: '', group: 'payment', label: 'کد مالیاتی', type: 'string', isSecret: false },
  { key: 'invoice_address', value: '', group: 'payment', label: 'آدرس صادرکننده', type: 'string', isSecret: false },
  { key: 'min_withdrawal', value: 5000000, group: 'payment', label: 'حداقل برداشت (تومان)', type: 'number', isSecret: false },
  // Support
  { key: 'ticket_auto_close_days', value: 7, group: 'support', label: 'روزهای بسته‌شدن تیکت', type: 'number', isSecret: false },
  { key: 'support_window_start', value: 9, group: 'support', label: 'ساعت شروع پشتیبانی', type: 'number', isSecret: false },
  { key: 'support_window_end', value: 18, group: 'support', label: 'ساعت پایان پشتیبانی', type: 'number', isSecret: false },
]
