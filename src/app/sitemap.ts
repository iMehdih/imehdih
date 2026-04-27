// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import Article from '@/models/Article'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://imehdih.ir'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB()

  const [products, articles] = await Promise.all([
    Product.find({ isActive: true }).select('slug updatedAt').lean(),
    Article.find({ status: 'published' }).select('slug updatedAt').lean(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/themes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/courses`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/files`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]

  const productRoutes: MetadataRoute.Sitemap = (products as any[]).map(p => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const articleRoutes: MetadataRoute.Sitemap = (articles as any[]).map(a => ({
    url: `${BASE}/blog/${a.slug}`,
    lastModified: a.updatedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...productRoutes, ...articleRoutes]
}
