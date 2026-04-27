// src/app/dashboard/downloads/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Order from '@/models/Order'
import Link from 'next/link'

const DOWNLOADABLE_TYPES = ['theme', 'plugin', 'file', 'course']

export default async function DashboardDownloadsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  await connectDB()

  const orders = await Order.find({
    userId: payload.userId,
    status: { $in: ['paid', 'completed'] },
    'items.productType': { $in: DOWNLOADABLE_TYPES },
  }).sort('-createdAt').lean()

  // Flatten items from all paid orders
  const downloads: any[] = []
  for (const order of orders as any[]) {
    for (const item of order.items) {
      if (DOWNLOADABLE_TYPES.includes(item.productType)) {
        downloads.push({ ...item, orderId: order._id, orderNumber: order.orderNumber, purchasedAt: order.createdAt })
      }
    }
  }

  const TYPE_LABELS: Record<string, string> = { theme: 'قالب', plugin: 'افزونه', file: 'فایل', course: 'دوره' }
  const TYPE_ICONS: Record<string, string> = { theme: '▣', plugin: '◆', file: '↓', course: '▶' }

  return (
    <div className="db-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>دانلودهای من</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{downloads.length} آیتم قابل دانلود</p>
      </div>

      {downloads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>↓</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>هنوز دانلودی ندارید</div>
          <p style={{ fontSize: 13, marginBottom: 20 }}>پس از خرید قالب، افزونه یا فایل، اینجا نمایش داده می‌شوند.</p>
          <Link href="/themes" className="site-btn site-btn-gold" style={{ fontSize: 14, padding: '11px 24px' }}>مشاهده محصولات</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {downloads.map((d, i) => (
            <div key={i} style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--b2)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {TYPE_ICONS[d.productType] || '▣'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{d.title}</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', display: 'flex', gap: 12 }}>
                  <span>{TYPE_LABELS[d.productType] || d.productType}</span>
                  <span>سفارش #{d.orderNumber}</span>
                  <span>{new Date(d.purchasedAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Link href={`/products/${d.productId}`} className="site-btn site-btn-outline" style={{ fontSize: 12.5, padding: '7px 14px' }}>
                  مشاهده
                </Link>
                <button className="site-btn site-btn-gold" style={{ fontSize: 12.5, padding: '7px 14px' }} disabled>
                  دانلود
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--t3)', textAlign: 'center' }}>
        لینک‌های دانلود در هفته ۴ (پس از راه‌اندازی Liara S3) فعال می‌شوند.
      </div>
    </div>
  )
}
