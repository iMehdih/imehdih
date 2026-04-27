// src/app/dashboard/courses/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Order from '@/models/Order'
import Link from 'next/link'

export default async function DashboardCoursesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  await connectDB()

  const orders = await Order.find({
    userId: payload.userId,
    status: { $in: ['paid', 'completed'] },
    'items.productType': 'course',
  }).sort('-createdAt').lean()

  const seen = new Set<string>()
  const courses: any[] = []
  for (const order of orders as any[]) {
    for (const item of (order as any).items) {
      if (item.productType === 'course' && !seen.has(item.productId?.toString())) {
        seen.add(item.productId?.toString())
        courses.push({ ...item, orderNumber: (order as any).orderNumber, purchasedAt: (order as any).createdAt })
      }
    }
  }

  return (
    <div className="db-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>دوره‌های من</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{courses.length} دوره</p>
      </div>

      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>▶</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>هنوز دوره‌ای ندارید</div>
          <p style={{ fontSize: 13, marginBottom: 20 }}>دوره‌های آموزشی خریداری شده اینجا نمایش داده می‌شوند.</p>
          <Link href="/courses" className="site-btn site-btn-gold" style={{ fontSize: 14, padding: '11px 24px' }}>مشاهده دوره‌ها</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="features-grid">
          {courses.map((c, i) => (
            <div key={i} style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ height: 140, background: 'var(--b2)', overflow: 'hidden', position: 'relative' }}>
                {c.meta?.thumbnail ? (
                  <img src={c.meta.thumbnail} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, opacity: .3 }}>▶</div>
                )}
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8, lineHeight: 1.4 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 14 }}>
                  خریداری: {new Date(c.purchasedAt).toLocaleDateString('fa-IR')}
                </div>
                <Link
                  href={`/dashboard/courses/${c.productId}`}
                  className="site-btn site-btn-gold"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '9px', display: 'flex' }}
                >
                  ▶ شروع دوره
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
