// src/app/api/admin/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Article from '@/models/Article'
import { getAuthUser } from '@/lib/auth/middleware'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  await connectDB()
  const article = await Article.findById(id).populate('authorId', 'firstName lastName').lean()
  if (!article) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
  return NextResponse.json({ article })
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const auth = await getAuthUser(req)
  if (!auth || !['admin', 'staff'].includes(auth.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  await connectDB()

  const article = await Article.findById(id)
  if (!article) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
  if (auth.role === 'staff' && article.authorId.toString() !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updates: Record<string, unknown> = {}
  const fields = ['title', 'slug', 'excerpt', 'content', 'thumbnail', 'categoryId', 'tags', 'status', 'isFeatured', 'seo']
  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f]
  }
  if (body.content) updates.readTime = Math.max(1, Math.ceil(body.content.split(/\s+/).length / 200))
  if (body.status === 'published' && article.status !== 'published') updates.publishedAt = new Date()

  const updated = await Article.findByIdAndUpdate(id, updates, { new: true })
  return NextResponse.json({ article: updated })
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const auth = await getAuthUser(req)
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  await Article.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
