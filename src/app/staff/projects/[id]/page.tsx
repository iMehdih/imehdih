// src/app/staff/projects/[id]/page.tsx
// صفحه تسک‌های پروژه برای کارمند
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Project from '@/models/Project'
import StaffTaskManager from '@/components/staff/StaffTaskManager'
import Link from 'next/link'

export default async function StaffProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'staff') redirect('/auth/login')

  const { id } = await params
  await connectDB()

  const project = await Project.findOne({
    _id: id,
    assignedTo: payload.userId,
  }).populate('customerId', 'firstName lastName mobile').lean()

  if (!project) redirect('/staff/projects')

  const p = project as any
  const serialized = JSON.parse(JSON.stringify(p))

  return (
    <div className="db-page">
      {/* Header */}
      <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Link href="/staff/projects" style={{ color: '#505062', fontSize: 12, textDecoration: 'none' }}>← بازگشت</Link>
          <span style={{ color: '#505062' }}>·</span>
          <span className={`db-badge ${p.status === 'completed' ? 'db-badge-green' : 'db-badge-blue'}`}>
            {p.status === 'completed' ? 'تکمیل شده' : 'در حال انجام'}
          </span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>{p.title}</div>
        <div style={{ fontSize: 12.5, color: '#505062' }}>
          مشتری: <strong style={{ color: '#EEEEF2' }}>
            {p.customerId?.firstName ? `${p.customerId.firstName} ${p.customerId.lastName}` : p.customerId?.mobile || '—'}
          </strong>
        </div>
      </div>

      <StaffTaskManager project={serialized} staffId={payload.userId} />
    </div>
  )
}
