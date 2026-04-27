// src/app/dashboard/subscription/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import Order from '@/models/Order'
import Link from 'next/link'

const FEATURES = [
  'دانلود نامحدود محصولات',
  'دسترسی به تمام دوره‌های آموزشی',
  'پشتیبانی اختصاصی ۲۴/۷',
  'تخفیف ۲۰٪ روی خدمات',
  'آپدیت رایگان ابزارها',
  'امتیاز VIP در لیدربورد',
]

export default async function DashboardSubscriptionPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  await connectDB()

  const user = await User.findById(payload.userId).select('firstName isVIP customerScore').lean() as any
  if (!user) redirect('/auth/login')

  // Check if user has an active subscription order
  const subOrder = await Order.findOne({
    userId: payload.userId,
    'items.productType': 'subscription_pro',
    status: { $in: ['paid', 'completed'] },
  }).sort('-createdAt').lean() as any

  const isActive = user.isVIP || !!subOrder

  return (
    <div className="db-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>اشتراک Pro</h1>
      </div>

      {isActive ? (
        <div style={{ background: 'linear-gradient(135deg, rgba(var(--gold-rgb),.08), var(--b1))', border: '2px solid var(--gold)', borderRadius: 16, padding: '28px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 32 }}>✦</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--gold)' }}>اشتراک Pro فعال</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                {user.firstName}، به باشگاه Pro خوش آمدید
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t2)' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 900, flexShrink: 0 }}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 16, padding: '28px 24px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>اشتراک Pro</h2>
            <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 20, lineHeight: 1.7 }}>
              با اشتراک Pro به تمام محتوا و خدمات ویژه دسترسی کامل داشته باشید.
            </p>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)', marginBottom: 6 }}>۲۹۰,۰۰۰ ت</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 20 }}>ماهانه — بدون قرارداد</div>
            <Link href="/products/subscription-pro" className="site-btn site-btn-gold" style={{ fontSize: 15, padding: '13px 32px', justifyContent: 'center', display: 'inline-flex' }}>
              فعال‌سازی اشتراک →
            </Link>
          </div>

          <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, padding: '20px 22px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>مزایای اشتراک Pro</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--t2)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: 900, flexShrink: 0 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--t3)', textAlign: 'center' }}>
        مدیریت خودکار تمدید اشتراک در هفته ۵ راه‌اندازی می‌شود.
      </div>
    </div>
  )
}
