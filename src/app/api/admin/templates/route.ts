// src/app/api/admin/templates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import ServiceTemplate from '@/models/ServiceTemplate'
import { requireRole } from '@/lib/auth/middleware'
import { z } from 'zod'

const fieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'number', 'image', 'file', 'url', 'textarea', 'select']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  usedInReport: z.boolean().default(false),
  reportLabel: z.string().optional(),
})

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  order: z.number().min(0),
  isRequired: z.boolean().default(true),
  isBlocking: z.boolean().default(false),
  recurringType: z.enum(['weekly', 'monthly', 'custom']).optional(),
  recurringInterval: z.number().optional(),
  recurringDayOfMonth: z.number().min(1).max(31).optional(),
  recurringDayOfWeek: z.number().min(0).max(6).optional(),
  fields: z.array(fieldSchema).default([]),
})

const templateSchema = z.object({
  productId: z.string().min(1),
  productType: z.string().min(1),
  title: z.string().min(2),
  tasks: z.array(taskSchema).min(1, 'حداقل یک تسک لازم است'),
  isActive: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['admin'])
    await connectDB()

    const templates = await ServiceTemplate.find()
      .sort('-createdAt')
      .populate('productId', 'title type')
      .lean()

    return NextResponse.json({ success: true, data: templates })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, ['admin'])
    const body = await req.json()
    const data = templateSchema.parse(body)

    await connectDB()

    const template = await ServiceTemplate.create(data)
    return NextResponse.json({ success: true, data: template }, { status: 201 })
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
