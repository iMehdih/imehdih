// src/app/staff/leaderboard/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'

export default async function StaffLeaderboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'staff') redirect('/auth/login')

  await connectDB()

  const staffList = await User.find({ role: 'staff', isActive: true })
    .select('firstName lastName rating totalTasksCompleted walletBalance departments')
    .sort({ rating: -1, totalTasksCompleted: -1 })
    .limit(20).lean()

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="db-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>لیدربورد</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>رتبه‌بندی بر اساس امتیاز و تعداد تسک</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(staffList as any[]).map((s, i) => {
          const isMe = s._id.toString() === payload.userId
          return (
            <div key={s._id.toString()} style={{
              background: isMe ? 'linear-gradient(135deg, rgba(var(--gold-rgb),.08), var(--b1))' : 'var(--b1)',
              border: `1px solid ${isMe ? 'var(--gold)' : 'var(--bd)'}`,
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ width: 32, fontSize: i < 3 ? 22 : 13, fontWeight: 900, color: 'var(--t3)', textAlign: 'center', flexShrink: 0 }}>
                {i < 3 ? medals[i] : `${i + 1}`}
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--b2)', border: '2px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, flexShrink: 0 }}>
                {s.firstName?.[0] || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>
                  {s.firstName} {s.lastName}
                  {isMe && <span style={{ marginRight: 8, fontSize: 10.5, color: 'var(--gold)', fontWeight: 900 }}>شما</span>}
                </div>
                {s.departments?.length > 0 && (
                  <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>{s.departments.join('، ')}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--gold)' }}>{(s.rating || 0).toFixed(1)}</div>
                  <div style={{ color: 'var(--t3)', fontSize: 11 }}>امتیاز</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{s.totalTasksCompleted || 0}</div>
                  <div style={{ color: 'var(--t3)', fontSize: 11 }}>تسک</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
