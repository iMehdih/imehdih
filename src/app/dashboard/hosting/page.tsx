// src/app/dashboard/hosting/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Hosting from '@/models/Hosting'
import Link from 'next/link'

const statusMap = {
  active: { label: 'فعال', cls: 'db-badge-green' },
  suspended: { label: 'معلق', cls: 'db-badge-red' },
  deleted: { label: 'حذف شده', cls: 'db-badge-gray' },
  pending: { label: 'در حال راه‌اندازی', cls: 'db-badge-yellow' },
}

export default async function CustomerHostingPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  await connectDB()
  const hostings = await Hosting.find({ userId: payload.userId }).sort('-createdAt').lean()

  return (
    <div className="db-page">
      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">هاست‌های من</div>
          <Link href="/products" className="db-btn db-btn-gold" style={{ fontSize: 12, padding: '6px 14px' }}>
            + خرید هاست جدید
          </Link>
        </div>

        {(hostings as any[]).length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon">◉</div>
            <div className="db-empty-text">هنوز هاستی خریداری نکرده‌اید</div>
            <Link href="/products" className="db-btn db-btn-gold">مشاهده پلن‌ها</Link>
          </div>
        ) : (
          <div>
            {(hostings as any[]).map(h => {
              const st = statusMap[h.status as keyof typeof statusMap] || { label: h.status, cls: 'db-badge-gray' }
              const now = new Date()
              const expiry = new Date(h.expiresAt)
              const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / 86400000)
              const pct = Math.max(0, Math.min(100, Math.round((daysLeft / 365) * 100)))
              const progressColor = daysLeft <= 7 ? 'red' : daysLeft <= 30 ? '' : 'green'

              return (
                <div key={h._id.toString()} style={{ padding: '20px', borderBottom: '1px solid var(--bd)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className={`db-badge ${st.cls}`}>{st.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{h.domain}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--t3)', flexWrap: 'wrap' }}>
                        <span>پلن: {h.plan}</span>
                        {h.serverIp && <span>IP: {h.serverIp}</span>}
                        <span>انقضا: {expiry.toLocaleDateString('fa-IR')}</span>
                      </div>
                    </div>
                    {h.status === 'active' || h.status === 'suspended' ? (
                      <Link href="/dashboard/tickets/new" className="db-btn db-btn-outline" style={{ fontSize: 12, padding: '6px 14px' }}>
                        تمدید
                      </Link>
                    ) : null}
                  </div>

                  {/* Progress */}
                  {h.status === 'active' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 5 }}>
                        <span style={{ color: 'var(--t3)' }}>اعتبار باقی‌مانده</span>
                        <span style={{ color: daysLeft <= 7 ? '#EF4444' : daysLeft <= 30 ? '#F59E0B' : '#22C55E', fontWeight: 700 }}>
                          {daysLeft > 0 ? `${daysLeft} روز` : 'منقضی شده'}
                        </span>
                      </div>
                      <div className="db-prog-wrap">
                        <div className={`db-prog-fill ${progressColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}

                  {h.status === 'active' && h.username && (
                    <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--b2)', borderRadius: 10, fontSize: 12.5 }}>
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        <span>نام کاربری: <strong style={{ color: 'var(--t)' }}>{h.username}</strong></span>
                        <span>رمز عبور: <strong style={{ color: 'var(--t)' }}>{'•'.repeat(8)}</strong></span>
                        <Link href="/dashboard/tickets/new" style={{ color: 'var(--gold)', fontSize: 12 }}>مشاهده کامل اطلاعات</Link>
                      </div>
                    </div>
                  )}

                  {h.status === 'suspended' && (
                    <div className="db-alert db-alert-error" style={{ marginTop: 12 }}>
                      ⚠ هاست شما معلق شده. برای فعال‌سازی مجدد تمدید کنید. تا ۷ روز دیگر حذف می‌شود.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
