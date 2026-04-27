// src/app/staff/notifications/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Notification from '@/models/Notification'

export default async function StaffNotificationsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'staff') redirect('/auth/login')

  await connectDB()

  const notifications = await Notification.find({ userId: payload.userId })
    .sort('-createdAt').limit(50).lean()

  return (
    <div className="db-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>اعلان‌ها</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{notifications.filter((n: any) => !n.isRead).length} خوانده نشده</p>
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>◐</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>اعلانی وجود ندارد</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(notifications as any[]).map(n => (
            <div key={n._id.toString()} style={{
              background: n.isRead ? 'var(--b1)' : 'var(--b2)',
              border: `1px solid ${n.isRead ? 'var(--bd)' : 'var(--gold)'}`,
              borderRadius: 12, padding: '16px 18px',
              display: 'flex', gap: 14,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: n.isRead ? 'var(--t3)' : 'var(--gold)', marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: n.isRead ? 600 : 800, fontSize: 14, marginBottom: 4 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{n.body}</div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 6 }}>{new Date(n.createdAt).toLocaleDateString('fa-IR')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
