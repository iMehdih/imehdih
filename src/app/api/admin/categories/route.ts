// src/app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Category from '@/models/Category'
import { getAuthUser } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || ''

  await connectDB()
  const filter: Record<string, unknown> = {}
  if (type) filter.type = type

  const categories = await Category.find(filter).sort({ type: 1, order: 1, name: 1 }).lean()
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, slug, description, type, parentId, order } = await req.json()
  if (!name?.trim() || !slug?.trim() || !type) {
    return NextResponse.json({ error: 'نام، slug و نوع الزامی است' }, { status: 400 })
  }

  await connectDB()
  const existing = await Category.findOne({ slug: slug.trim().toLowerCase(), type })
  if (existing) return NextResponse.json({ error: 'این slug برای این نوع قبلاً استفاده شده' }, { status: 409 })

  const cat = await Category.create({ name: name.trim(), slug: slug.trim().toLowerCase(), description, type, parentId: parentId || undefined, order: order || 0 })
  return NextResponse.json({ category: cat }, { status: 201 })
}
