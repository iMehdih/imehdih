// src/app/api/admin/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Expense from '@/models/Expense'
import { requireRole } from '@/lib/auth/middleware'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(2),
  amount: z.number().positive(),
  category: z.enum(['salary','bonus','infrastructure','marketing','tools','tax','other']),
  type: z.enum(['manual','offline']).default('manual'),
  description: z.string().optional(),
  date: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const category = searchParams.get('category')

    const filter: Record<string, unknown> = {}
    if (category) filter.category = category

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort('-date').skip((page-1)*limit).limit(limit)
        .populate('createdBy', 'firstName lastName').lean(),
      Expense.countDocuments(filter),
    ])

    return NextResponse.json({ success: true, data: { items: expenses, total, page, totalPages: Math.ceil(total/limit) } })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin'])
    const body = await req.json()
    const data = schema.parse(body)

    await connectDB()

    const expense = await Expense.create({
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
      createdBy: auth.userId,
    })

    return NextResponse.json({ success: true, data: expense }, { status: 201 })
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
