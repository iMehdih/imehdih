import { connectDB } from '@/lib/db/mongoose'
import Notification from '@/models/Notification'
import { sendTemplateSMS, SMS_TEMPLATES } from '@/lib/sms/kavenegar'
import User from '@/models/User'

interface NotifyOptions {
  userId: string
  title: string
  content: string
  type?: 'system' | 'order' | 'ticket' | 'project' | 'payment' | 'broadcast'
  relatedId?: string
  relatedModel?: string
  smsTemplate?: keyof typeof SMS_TEMPLATES
  smsTokens?: Record<string, string>
}

export async function notify(opts: NotifyOptions): Promise<void> {
  await connectDB()

  // ذخیره notification داخلی
  await Notification.create({
    userId: opts.userId,
    title: opts.title,
    content: opts.content,
    type: opts.type || 'system',
    relatedId: opts.relatedId,
    relatedModel: opts.relatedModel,
  })

  // ارسال SMS اگه template داشت
  if (opts.smsTemplate && opts.smsTokens) {
    const user = await User.findById(opts.userId).select('mobile')
    if (user?.mobile) {
      const template = SMS_TEMPLATES[opts.smsTemplate]
      await sendTemplateSMS(user.mobile, template, opts.smsTokens)
    }
  }
}

// broadcast به گروهی از کاربران
export async function broadcastNotify(
  userIds: string[],
  title: string,
  content: string,
  sendSMS = false
): Promise<void> {
  await connectDB()

  const notifications = userIds.map(userId => ({
    userId,
    title,
    content,
    type: 'broadcast' as const,
  }))

  await Notification.insertMany(notifications)

  if (sendSMS) {
    const users = await User.find({ _id: { $in: userIds } }).select('mobile')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    for (const user of users) {
      await sendTemplateSMS(user.mobile, SMS_TEMPLATES.NEW_MESSAGE, { link: `${appUrl}/dashboard` })
    }
  }
}
