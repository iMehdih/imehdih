// src/app/api/blog/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Article from '@/models/Article'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = 12
  const q = searchParams.get('q') || ''

  await connectDB()

  const filter: Record<string, unknown> = { status: 'published' }
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }

  const [articles, total] = await Promise.all([
    Article.find(filter).sort('-publishedAt').skip((page - 1) * limit).limit(limit)
      .select('title slug excerpt thumbnail authorId readTime viewCount publishedAt tags')
      .populate('authorId', 'firstName lastName')
      .lean(),
    Article.countDocuments(filter),
  ])

  return NextResponse.json({ articles, total, pages: Math.ceil(total / limit) })
}
