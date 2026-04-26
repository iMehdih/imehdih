// src/app/api/admin/notifications/route.ts
// broadcast ادمین با فیلتر
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Notification from '@/models/Notification'
import User from '@/models/User'
import Order from '@/models/Order'
import { requireRole } from '@/lib/auth/middleware'
import { sendTemplateSMS, SMS_TEMPLATES } from '@/lib/sms/kavenegar'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(2),
  content: z.string().min(5),
  // فیلتر گیرندگان
  targetRole: z.enum(['customer', 'staff', 'all']).default('customer'),
  targetProductId: z.string().optional(), // فقط خریداران این محصول
  targetProductType: z.string().optional(), // فقط خریداران این نوع محصول
  // آیا پیامک هم بره؟
  sendSMS: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin'])
    const body = await req.json()
    const data = schema.parse(body)

    await connectDB()

    // پیدا کردن گیرندگان
    let userIds: string[] = []

    if (data.targetProductId || data.targetProductType) {
      // فقط خریداران یه محصول خاص یا نوع خاص
      const orderFilter: Record<string, unknown> = {
        status: { $in: ['paid', 'in_progress', 'completed'] },
      }
      if (data.targetProductId) {
        orderFilter['items.productId'] = data.targetProductId
      }
      if (data.targetProductType) {
        orderFilter['items.productType'] = data.targetProductType
      }

      const orders = await Order.find(orderFilter).select('userId').lean()
      userIds = [...new Set((orders as any[]).map(o => o.userId.toString()))]
    } else {
      // بر اساس role
      const roleFilter: Record<string, unknown> = { isActive: true }
      if (data.targetRole !== 'all') {
        roleFilter.role = data.targetRole
      }
      const users = await User.find(roleFilter).select('_id').lean()
      userIds = (users as any[]).map(u => u._id.toString())
    }

    if (userIds.length === 0) {
      return NextResponse.json({ success: false, error: 'هیچ کاربری با این فیلتر یافت نشد' }, { status: 400 })
    }

    // ایجاد notification داخلی برای همه
    const notifications = userIds.map(userId => ({
      userId,
      title: data.title,
      content: data.content,
      type: 'broadcast' as const,
      isRead: false,
    }))

    await Notification.insertMany(notifications)

    // ارسال SMS اگه درخواست شده
    let smsSent = 0
    if (data.sendSMS) {
      const users = await User.find({ _id: { $in: userIds } }).select('mobile').lean()
      const appUrl = process.env.NEXT_PUBLIC_APP_URL

      for (const user of users as any[]) {
        try {
          await sendTemplateSMS(user.mobile, SMS_TEMPLATES.NEW_MESSAGE, {
            link: `${appUrl}/dashboard/notifications`,
          })
          smsSent++
        } catch (e) {
          console.error(`SMS failed for ${user.mobile}:`, e)
        }
      }
    }

    // ثبت در audit log
    const AuditLog = (await import('@/models/AuditLog')).default
    await AuditLog.create({
      userId: auth.userId,
      userRole: 'admin',
      action: 'broadcast_notification',
      entity: 'Notification',
      after: {
        title: data.title,
        recipientCount: userIds.length,
        smsSent,
        targetRole: data.targetRole,
        targetProductId: data.targetProductId,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        recipientCount: userIds.length,
        smsSent,
        message: `اعلان به ${userIds.length} نفر ارسال شد${smsSent > 0 ? ` و ${smsSent} پیامک ارسال شد` : ''}`,
      },
    })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

// GET — تاریخچه broadcast‌های ارسال شده
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['admin'])
    await connectDB()

    const AuditLog = (await import('@/models/AuditLog')).default
    const logs = await AuditLog.find({ action: 'broadcast_notification' })
      .sort('-createdAt')
      .limit(30)
      .populate('userId', 'firstName lastName')
      .lean()

    return NextResponse.json({ success: true, data: logs })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
