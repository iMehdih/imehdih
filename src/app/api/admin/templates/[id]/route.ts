// src/app/api/admin/templates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import ServiceTemplate from '@/models/ServiceTemplate'
import { requireRole } from '@/lib/auth/middleware'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, ['admin', 'staff'])
    const { id } = await params
    await connectDB()
    const template = await ServiceTemplate.findById(id).populate('productId', 'title type')
    if (!template) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 })
    return NextResponse.json({ success: true, data: template })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, ['admin'])
    const { id } = await params
    const body = await req.json()
    await connectDB()
    const template = await ServiceTemplate.findByIdAndUpdate(id, { $set: body }, { new: true })
    if (!template) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 })
    return NextResponse.json({ success: true, data: template })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, ['admin'])
    const { id } = await params
    await connectDB()
    await ServiceTemplate.findByIdAndUpdate(id, { isActive: false })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
