// src/app/staff/projects/available/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Project from '@/models/Project'
import ClaimProjectButton from '@/components/staff/ClaimProjectButton'

export default async function AvailableProjectsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'staff') redirect('/auth/login')

  await connectDB()

  const projects = await Project.find({
    status: 'available',
    $or: [
      { isSpecificStaff: false },
      { isSpecificStaff: true, specificStaffId: payload.userId },
    ],
  })
    .populate('customerId', 'firstName lastName')
    .populate('templateId', 'title')
    .lean()

  return (
    <div className="db-page">
      <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 20 }}>
        {(projects as any[]).length} پروژه منتظر کارمند
      </div>

      {(projects as any[]).length === 0 ? (
        <div className="db-card">
          <div className="db-empty">
            <div className="db-empty-icon">◈</div>
            <div className="db-empty-text">در حال حاضر پروژه‌ای برای دریافت وجود ندارد</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(projects as any[]).map(p => (
            <div key={p._id.toString()} className="db-card">
              <div style={{ padding: '20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {p.type === 'internal' ? '⚙' : '◈'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 900 }}>{p.title}</div>
                    {p.type === 'internal' && (
                      <span style={{ fontSize: 9.5, fontWeight: 900, padding: '2px 7px', borderRadius: 100, background: 'rgba(96,165,250,0.1)', color: 'var(--blue)', border: '1px solid rgba(96,165,250,0.2)' }}>درون‌سازمانی</span>
                    )}
                    {p.isSpecificStaff && (
                      <span style={{ fontSize: 9.5, fontWeight: 900, padding: '2px 7px', borderRadius: 100, background: 'rgba(200,169,110,0.1)', color: 'var(--gold)', border: '1px solid rgba(200,169,110,0.2)' }}>اختصاصی شما</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--t3)', flexWrap: 'wrap' }}>
                    {p.customerId && p.type !== 'internal' && (
                      <span>مشتری: {p.customerId.firstName} {p.customerId.lastName}</span>
                    )}
                    <span>{p.tasks?.length || 0} تسک</span>
                    {p.commissionRate && p.type !== 'internal' && (
                      <span style={{ color: 'var(--green)' }}>کمیسیون {p.commissionRate}٪</span>
                    )}
                    <span>{new Date(p.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
                <ClaimProjectButton projectId={p._id.toString()} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
