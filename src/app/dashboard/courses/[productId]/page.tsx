// src/app/dashboard/courses/[productId]/page.tsx
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Order from '@/models/Order'
import Product from '@/models/Product'
import Link from 'next/link'
import CoursePlayer from '@/components/ui/CoursePlayer'
import type { Lesson } from '@/components/ui/CoursePlayer'

export default async function CoursePlayerPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params

  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/auth/login')

  await connectDB()

  // verify purchase
  const hasPurchased = await Order.exists({
    userId: payload.userId,
    status: { $in: ['paid', 'completed'] },
    'items.productId': productId,
  })
  if (!hasPurchased) redirect('/dashboard/courses')

  const product = await Product.findById(productId).lean()
  if (!product || (product as any).type !== 'course') notFound()

  const p = product as any

  // Build lessons from meta.playlist or single meta.videoUrl
  let lessons: Lesson[] = []
  if (Array.isArray(p.meta?.playlist) && p.meta.playlist.length > 0) {
    lessons = p.meta.playlist.map((l: any) => ({
      title: l.title || 'بدون عنوان',
      videoUrl: l.videoUrl || l.url || '',
      duration: l.duration,
      free: !!l.free,
    }))
  } else if (p.meta?.videoUrl) {
    lessons = [{ title: p.title, videoUrl: p.meta.videoUrl as string }]
  }

  return (
    <div className="db-page" style={{ padding: 0 }}>
      {/* Breadcrumb */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t2)' }}>
        <Link href="/dashboard/courses" style={{ color: 'var(--t3)', textDecoration: 'none' }}>دوره‌های من</Link>
        <span>›</span>
        <span style={{ color: 'var(--t)' }}>{p.title}</span>
      </div>

      {lessons.length > 0 ? (
        <CoursePlayer courseTitle={p.title} lessons={lessons} />
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--t3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>▶</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>محتوای دوره در حال بارگذاری است</div>
          <p style={{ fontSize: 13, marginBottom: 24 }}>ویدیوهای این دوره به زودی اضافه می‌شوند.</p>
          <Link href="/dashboard/courses" className="site-btn site-btn-outline" style={{ fontSize: 13 }}>
            بازگشت به دوره‌ها
          </Link>
        </div>
      )}
    </div>
  )
}
