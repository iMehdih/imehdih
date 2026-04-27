// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import Article from '@/models/Article'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''
  const type = searchParams.get('type') || 'all' // all | product | article

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], articles: [], total: 0 })
  }

  await connectDB()

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regexFilter = { $regex: escaped, $options: 'i' }

  const [products, articles] = await Promise.all([
    type !== 'article'
      ? Product.find({
          isActive: true,
          $or: [{ title: regexFilter }, { shortDescription: regexFilter }, { tags: regexFilter }],
        }).select('title slug thumbnail type price salePrice rating').limit(12).lean()
      : [],
    type !== 'product'
      ? Article.find({
          status: 'published',
          $or: [{ title: regexFilter }, { excerpt: regexFilter }, { tags: regexFilter }],
        }).select('title slug thumbnail excerpt readTime publishedAt').limit(6).lean()
      : [],
  ])

  return NextResponse.json({
    products,
    articles,
    total: products.length + articles.length,
    query: q,
  })
}
