// src/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://imehdih.ir'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/staff/', '/dashboard/', '/api/', '/auth/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
