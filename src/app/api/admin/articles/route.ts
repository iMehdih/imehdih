// src/app/api/admin/articles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Article from '@/models/Article'
import { getAuthUser } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth || !['admin', 'staff'].includes(auth.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = 20
  const q = searchParams.get('q') || ''
  const status = searchParams.get('status') || ''

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (auth.role === 'staff') filter.authorId = auth.userId
  if (status) filter.status = status
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }

  const [articles, total] = await Promise.all([
    Article.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit)
      .populate('authorId', 'firstName lastName').lean(),
    Article.countDocuments(filter),
  ])

  return NextResponse.json({ articles, total, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth || !['admin', 'staff'].includes(auth.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, slug, excerpt, content, thumbnail, categoryId, tags, status, isFeatured, seo } = body

  if (!title?.trim() || !slug?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'عنوان، slug و محتوا الزامی است' }, { status: 400 })
  }

  await connectDB()
  const readTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200))
  const publishedAt = status === 'published' ? new Date() : undefined

  const article = await Article.create({
    title: title.trim(),
    slug: slug.trim().toLowerCase(),
    excerpt: excerpt?.trim(),
    content: content.trim(),
    thumbnail: thumbnail?.trim(),
    authorId: auth.userId,
    categoryId: categoryId || undefined,
    tags: tags || [],
    status: status || 'draft',
    isFeatured: !!isFeatured,
    readTime,
    publishedAt,
    seo,
  })

  return NextResponse.json({ article }, { status: 201 })
}
