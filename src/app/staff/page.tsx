// src/app/staff/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import Project from '@/models/Project'
import Ticket from '@/models/Ticket'
import Link from 'next/link'

export default async function StaffDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'staff') redirect('/auth/login')

  await connectDB()

  const [staff, myProjects, availableProjects, myTickets] = await Promise.all([
    User.findById(payload.userId).select('firstName lastName walletBalance rating totalTasksCompleted departments').lean(),
    Project.find({ assignedTo: payload.userId, status: { $in: ['in_progress', 'assigned'] } })
      .populate('customerId', 'firstName lastName')
      .lean(),
    Project.countDocuments({
      status: 'available',
      $or: [{ isSpecificStaff: false }, { isSpecificStaff: true, specificStaffId: payload.userId }],
    }),
    Ticket.countDocuments({ assignedTo: payload.userId, status: { $nin: ['closed', 'cancelled'] } }),
  ])

  const s = staff as any

  return (
    <div className="db-page">
      {/* Stats */}
      <div className="db-stats-grid" style={{ marginBottom: 20 }}>
        <div className="db-stat-card">
          <div className="db-stat-icon">◈</div>
          <div className="db-stat-val">{(myProjects as any[]).length}</div>
          <div className="db-stat-lbl">پروژه فعال</div>
        </div>
        <div className="db-stat-card gold">
          <div className="db-stat-icon">◉</div>
          <div className="db-stat-val" style={{ color: 'var(--yellow)' }}>{availableProjects}</div>
          <div className="db-stat-lbl">پروژه موجود</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon">✉</div>
          <div className="db-stat-val">{myTickets}</div>
          <div className="db-stat-lbl">تیکت باز</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon">✦</div>
          <div className="db-stat-val">{((s?.walletBalance || 0) / 1000000).toFixed(1)}م</div>
          <div className="db-stat-lbl">موجودی کیف پول</div>
        </div>
      </div>

      <div className="db-2col">
        {/* My Projects */}
        <div className="db-card">
          <div className="db-card-head">
            <div className="db-card-title">پروژه‌های فعال من</div>
            <Link href="/staff/projects" className="db-card-link">همه ←</Link>
          </div>
          {(myProjects as any[]).length === 0 ? (
            <div className="db-empty" style={{ padding: '28px 20px' }}>
              <div className="db-empty-icon">◈</div>
              <div className="db-empty-text">پروژه فعالی ندارید</div>
              <Link href="/staff/projects/available" className="db-btn db-btn-gold" style={{ marginTop: 8, fontSize: 12 }}>
                مشاهده پروژه‌های موجود
              </Link>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead><tr><th>پروژه</th><th>مشتری</th><th>پیشرفت</th><th>عملیات</th></tr></thead>
                <tbody>
                  {(myProjects as any[]).map(p => {
                    const total = p.tasks?.length || 0
                    const done = p.tasks?.filter((t: any) => t.status === 'completed').length || 0
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0
                    return (
                      <tr key={p._id.toString()}>
                        <td style={{ fontWeight: 700 }}>{p.title}</td>
                        <td style={{ fontSize: 12 }}>{p.customerId?.firstName ? `${p.customerId.firstName} ${p.customerId.lastName}` : '—'}</td>
                        <td style={{ width: 120 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div className="db-prog-wrap" style={{ flex: 1 }}>
                              <div className="db-prog-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span style={{ fontSize: 10.5, color: 'var(--t3)', flexShrink: 0 }}>{pct}٪</span>
                          </div>
                        </td>
                        <td>
                          <Link href={`/staff/projects/${p._id}`} className="db-btn db-btn-outline" style={{ padding: '5px 12px', fontSize: 11.5 }}>
                            ادامه
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

        {/* Available Projects Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {availableProjects > 0 && (
            <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.05))', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, padding: '20px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>◉</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--yellow)', marginBottom: 4 }}>{availableProjects} پروژه</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 14 }}>منتظر کارمند است</div>
              <Link href="/staff/projects/available" className="db-btn" style={{ background: 'var(--yellow)', color: '#000', fontSize: 13, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                مشاهده و دریافت
              </Link>
            </div>
          )}

          {/* Wallet Card */}
          <div style={{ background: 'linear-gradient(135deg,rgba(200,169,110,0.12),rgba(200,169,110,0.04))', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 14, padding: '20px' }}>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>موجودی کیف پول</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)', marginBottom: 4 }}>
              {((s?.walletBalance || 0) / 1000000).toFixed(1)}م <span style={{ fontSize: 13, fontWeight: 500 }}>تومان</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', marginBottom: 14 }}>امتیاز: {s?.rating || 5}/5 · {s?.totalTasksCompleted || 0} تسک کامل</div>
            <Link href="/staff/wallet" className="db-btn db-btn-gold" style={{ fontSize: 12, padding: '8px 18px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              درخواست برداشت
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
