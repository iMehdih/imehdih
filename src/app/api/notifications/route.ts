// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Notification from '@/models/Notification'
import { requireAuth } from '@/lib/auth/middleware'

// GET — لیست اعلان‌های کاربر
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread') === 'true'

    const filter: Record<string, unknown> = { userId: auth.userId }
    if (unreadOnly) filter.isRead = false

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: auth.userId, isRead: false }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

// PUT — خواندن همه اعلان‌ها
export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    await connectDB()

    await Notification.updateMany(
      { userId: auth.userId, isRead: false },
      { isRead: true }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
