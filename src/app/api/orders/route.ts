// src/app/api/orders/route.ts — لیست سفارشات مشتری
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Order from '@/models/Order'
import { requireAuth } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const filter: Record<string, unknown> = { userId: auth.userId }
    if (status) filter.status = status

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}