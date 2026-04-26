// src/app/admin/hosting/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Hosting from '@/models/Hosting'
import AdminHostingActions from '@/components/admin/AdminHostingActions'

const statusColors = {
  active: 'green', suspended: 'red', deleted: 'gray', pending: 'yellow',
}
const statusLabels = {
  active: 'فعال', suspended: 'معلق', deleted: 'حذف شده', pending: 'در انتظار',
}

export default async function AdminHostingPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  await connectDB()

  const hostings = await Hosting.find()
    .sort('-createdAt')
    .populate('userId', 'firstName lastName mobile')
    .lean()

  const pending = (hostings as any[]).filter(h => h.status === 'pending').length
  const active = (hostings as any[]).filter(h => h.status === 'active').length

  return (
    <div className="admin-page">
      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, minWidth: 120 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--gold)' }}>{active}</div>
          <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>هاست فعال</div>
        </div>
        <div style={{ padding: '16px 20px', background: 'var(--b1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, minWidth: 120 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--yellow)' }}>{pending}</div>
          <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>در انتظار راه‌اندازی</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div className="admin-card-title">هاست‌ها ({hostings.length})</div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>مشتری</th><th>دامنه</th><th>پلن</th><th>انقضا</th><th>وضعیت</th><th>عملیات</th></tr>
            </thead>
            <tbody>
              {(hostings as any[]).map(h => {
                const st = statusColors[h.status as keyof typeof statusColors] || 'gray'
                const sl = statusLabels[h.status as keyof typeof statusLabels] || h.status
                const daysLeft = Math.ceil((new Date(h.expiresAt).getTime() - Date.now()) / 86400000)
                return (
                  <tr key={h._id.toString()}>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {h.userId?.firstName ? `${h.userId.firstName} ${h.userId.lastName}` : '—'}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--t3)' }}>{h.userId?.mobile}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{h.domain}</div>
                      {h.serverIp && <div style={{ fontSize: 10.5, color: 'var(--t3)' }}>{h.serverIp}</div>}
                    </td>
                    <td style={{ fontSize: 12 }}>{h.plan}</td>
                    <td>
                      <div style={{ fontSize: 12 }}>{new Date(h.expiresAt).toLocaleDateString('fa-IR')}</div>
                      <div style={{ fontSize: 10.5, color: daysLeft <= 7 ? 'var(--red)' : daysLeft <= 30 ? 'var(--yellow)' : 'var(--t3)' }}>
                        {daysLeft > 0 ? `${daysLeft} روز` : 'منقضی'}
                      </div>
                    </td>
                    <td><span className={`admin-badge admin-badge-${st}`}>{sl}</span></td>
                    <td>
                      <AdminHostingActions hostingId={h._id.toString()} currentStatus={h.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
