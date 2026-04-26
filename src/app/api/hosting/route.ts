// src/app/api/hosting/route.ts — لیست هاست‌های مشتری
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Hosting from '@/models/Hosting'
import { requireAuth } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    await connectDB()

    const hostings = await Hosting.find({ userId: auth.userId })
      .sort('-createdAt').lean()

    return NextResponse.json({ success: true, data: hostings })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
