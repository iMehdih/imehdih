// src/app/api/admin/hosting/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Hosting from '@/models/Hosting'
import { requireRole } from '@/lib/auth/middleware'
import { notify } from '@/lib/utils/notify'
import { z } from 'zod'

const schema = z.object({
  status: z.enum(['active','suspended','deleted']).optional(),
  serverIp: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(req, ['admin'])
    const { id } = await params
    const body = await req.json()
    const data = schema.parse(body)

    await connectDB()

    const hosting = await Hosting.findByIdAndUpdate(id, { $set: data }, { new: true })
    if (!hosting) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 })

    if (data.status === 'active') {
      await notify({
        userId: hosting.userId.toString(),
        title: 'هاست شما فعال شد',
        content: `هاست ${hosting.domain} راه‌اندازی و فعال شد. جزئیات در پنل کاربری موجود است.`,
        type: 'order',
      })
    }

    return NextResponse.json({ success: true, data: hosting })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
