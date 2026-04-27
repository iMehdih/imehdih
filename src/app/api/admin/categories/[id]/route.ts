// src/app/api/admin/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Category from '@/models/Category'
import { getAuthUser } from '@/lib/auth/middleware'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser(req)
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { name, slug, description, type, parentId, order, isActive } = await req.json()

  await connectDB()
  const cat = await Category.findByIdAndUpdate(id, {
    ...(name && { name: name.trim() }),
    ...(slug && { slug: slug.trim().toLowerCase() }),
    ...(description !== undefined && { description }),
    ...(type && { type }),
    ...(parentId !== undefined && { parentId: parentId || null }),
    ...(order !== undefined && { order }),
    ...(isActive !== undefined && { isActive }),
  }, { new: true })

  if (!cat) return NextResponse.json({ error: 'دسته‌بندی یافت نشد' }, { status: 404 })
  return NextResponse.json({ category: cat })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser(req)
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  await Category.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
