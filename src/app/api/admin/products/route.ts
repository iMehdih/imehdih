// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import { requireRole } from '@/lib/auth/middleware'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['admin'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const filter: Record<string, unknown> = {}
    if (type) filter.type = type
    if (search) filter.title = { $regex: search, $options: 'i' }

    const [items, total] = await Promise.all([
      Product.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
    ])

    return NextResponse.json({ success: true, data: { items, total, page, totalPages: Math.ceil(total / limit) } })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

const productSchema = z.object({
  type: z.enum(['theme', 'plugin', 'course', 'file', 'service_project', 'service_recurring', 'hosting', 'domain', 'subscription_pro']),
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().default(''),
  shortDescription: z.string().default(''),
  price: z.number().min(0),
  salePrice: z.number().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  supportDuration: z.number().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  meta: z.record(z.unknown()).default({}),
})

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, ['admin'])
    const body = await req.json()
    const data = productSchema.parse(body)

    await connectDB()

    const existing = await Product.findOne({ slug: data.slug })
    if (existing) {
      return NextResponse.json({ success: false, error: 'این slug قبلاً استفاده شده' }, { status: 400 })
    }

    const product = await Product.create(data)
    return NextResponse.json({ success: true, data: product }, { status: 201 })
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