// src/app/staff/performance/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import Project from '@/models/Project'
import WalletTransaction from '@/models/WalletTransaction'

export default async function StaffPerformancePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'staff') redirect('/auth/login')

  await connectDB()

  const [staff, completedProjects, totalEarnings] = await Promise.all([
    User.findById(payload.userId).select('firstName lastName rating totalTasksCompleted walletBalance departments salary').lean() as any,
    Project.countDocuments({ assignedTo: payload.userId, status: 'completed' }),
    WalletTransaction.aggregate([
      { $match: { userId: payload.userId, type: 'salary', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ])

  if (!staff) redirect('/auth/login')

  const totalEarned = totalEarnings[0]?.total || 0

  const stats = [
    { label: 'امتیاز کلی', value: (staff.rating || 5).toFixed(1), icon: '⭐', color: 'var(--gold)' },
    { label: 'تسک‌های تکمیل شده', value: staff.totalTasksCompleted || 0, icon: '✓', color: 'var(--green)' },
    { label: 'پروژه‌های تمام شده', value: completedProjects, icon: '◉', color: 'var(--blue)' },
    { label: 'کل درآمد (ت)', value: totalEarned.toLocaleString('fa'), icon: '✦', color: 'var(--gold)' },
  ]

  return (
    <div className="db-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>عملکرد من</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{staff.firstName} {staff.lastName}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }} className="db-stats-grid">
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, padding: '18px 16px' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Profile info */}
      <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, padding: '24px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>اطلاعات شغلی</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {staff.departments?.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
              <span style={{ color: 'var(--t3)' }}>دپارتمان‌ها</span>
              <span style={{ fontWeight: 700 }}>{staff.departments.join('، ')}</span>
            </div>
          )}
          {staff.salary && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
              <span style={{ color: 'var(--t3)' }}>حقوق پایه (ماهانه)</span>
              <span style={{ fontWeight: 700 }}>{staff.salary.toLocaleString('fa')} تومان</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
            <span style={{ color: 'var(--t3)' }}>موجودی کیف پول</span>
            <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{(staff.walletBalance || 0).toLocaleString('fa')} تومان</span>
          </div>
        </div>
      </div>
    </div>
  )
}
