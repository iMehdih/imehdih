// src/app/staff/customers/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Project from '@/models/Project'
import User from '@/models/User'

export default async function StaffCustomersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'staff') redirect('/auth/login')

  await connectDB()

  // Get unique customers from staff's projects
  const projects = await Project.find({ assignedTo: payload.userId })
    .populate('customerId', 'firstName lastName mobile email isVIP customerScore')
    .lean()

  const seen = new Set<string>()
  const customers: any[] = []
  for (const p of projects as any[]) {
    if (p.customerId && !seen.has(p.customerId._id.toString())) {
      seen.add(p.customerId._id.toString())
      customers.push({ ...p.customerId, projectCount: 0 })
    }
  }
  for (const p of projects as any[]) {
    const c = customers.find(c => c._id.toString() === p.customerId?._id?.toString())
    if (c) c.projectCount++
  }

  return (
    <div className="db-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>مشتریان من</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{customers.length} مشتری از پروژه‌های شما</p>
      </div>

      {customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>◎</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>هنوز مشتری‌ای با شما کار نکرده</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="customers-grid">
          {customers.map(c => (
            <div key={c._id.toString()} style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#000', flexShrink: 0 }}>
                  {c.firstName?.[0] || c.mobile?.[2] || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{c.firstName} {c.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 1 }}>{c.mobile}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12.5 }}>
                <div style={{ color: 'var(--t3)' }}>پروژه‌ها: <span style={{ fontWeight: 700, color: 'var(--t)' }}>{c.projectCount}</span></div>
                <div style={{ color: 'var(--t3)' }}>امتیاز: <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{c.customerScore || 0}</span></div>
                {c.isVIP && <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--gold)', background: 'rgba(var(--gold-rgb),.1)', padding: '2px 6px', borderRadius: 6 }}>VIP</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
