// src/app/dashboard/domains/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import DomainRecord from '@/models/DomainRecord'
import Link from 'next/link'

const statusMap = {
  active: { label: 'فعال', cls: 'db-badge-green' },
  expired: { label: 'منقضی', cls: 'db-badge-red' },
  pending: { label: 'در انتظار', cls: 'db-badge-yellow' },
  failed: { label: 'ناموفق', cls: 'db-badge-red' },
}

export default async function CustomerDomainsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  await connectDB()
  const domains = await DomainRecord.find({ userId: payload.userId }).sort('-createdAt').lean()

  return (
    <div className="db-page">
      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">دامنه‌های من</div>
          <Link href="/products" className="db-btn db-btn-gold" style={{ fontSize: 12, padding: '6px 14px' }}>
            + ثبت دامنه جدید
          </Link>
        </div>

        {(domains as any[]).length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon">◎</div>
            <div className="db-empty-text">هنوز دامنه‌ای ثبت نکرده‌اید</div>
          </div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>دامنه</th>
                  <th>پسوند</th>
                  <th>ثبت‌کننده</th>
                  <th>انقضا</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {(domains as any[]).map(d => {
                  const st = statusMap[d.status as keyof typeof statusMap] || { label: d.status, cls: 'db-badge-gray' }
                  const daysLeft = Math.ceil((new Date(d.expiresAt).getTime() - Date.now()) / 86400000)
                  return (
                    <tr key={d._id.toString()}>
                      <td style={{ fontWeight: 700 }}>{d.domain}</td>
                      <td style={{ fontSize: 12 }}>.{d.tld}</td>
                      <td style={{ fontSize: 12 }}>{d.registrar === 'farasoo' ? 'فراسو' : 'ایران‌سرور'}</td>
                      <td>
                        <div style={{ fontSize: 12 }}>{new Date(d.expiresAt).toLocaleDateString('fa-IR')}</div>
                        <div style={{ fontSize: 10.5, color: daysLeft <= 30 ? '#F59E0B' : 'var(--t3)' }}>
                          {daysLeft > 0 ? `${daysLeft} روز مانده` : 'منقضی'}
                        </div>
                      </td>
                      <td><span className={`db-badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        <Link href="/dashboard/tickets/new" className="db-btn db-btn-outline" style={{ padding: '5px 12px', fontSize: 11.5 }}>
                          تمدید
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
