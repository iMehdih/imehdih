// src/app/api/domains/route.ts — لیست دامنه‌های مشتری
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import DomainRecord from '@/models/DomainRecord'
import { requireAuth } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    await connectDB()

    const domains = await DomainRecord.find({ userId: auth.userId })
      .sort('-createdAt').lean()

    return NextResponse.json({ success: true, data: domains })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
