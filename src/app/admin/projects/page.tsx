// src/app/admin/projects/page.tsx
import { connectDB } from '@/lib/db/mongoose'
import Project from '@/models/Project'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  available: 'موجود', assigned: 'اختصاص‌یافته', in_progress: 'در حال انجام',
  completed: 'تکمیل شده', cancelled: 'لغو شده',
}
const STATUS_COLORS: Record<string, string> = {
  available: 'var(--green)', assigned: 'var(--blue)', in_progress: 'var(--gold)',
  completed: 'var(--t3)', cancelled: 'var(--red)',
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page || 1))
  const limit = 20
  const statusFilter = sp.status || ''

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (statusFilter) filter.status = statusFilter

  const [projects, total] = await Promise.all([
    Project.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit)
      .populate('customerId', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .lean(),
    Project.countDocuments(filter),
  ])

  const pages = Math.ceil(total / limit)

  const buildUrl = (params: Record<string, string>) => {
    const p = { ...(statusFilter && { status: statusFilter }), ...params }
    return `/admin/projects?${new URLSearchParams(p)}`
  }

  return (
    <div className="db-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>پروژه‌ها</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{total} پروژه</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'available', 'in_progress', 'completed'].map(s => (
            <Link key={s} href={buildUrl(s ? { status: s } : {})} className={`site-btn ${statusFilter === s ? 'site-btn-gold' : 'site-btn-outline'}`} style={{ fontSize: 12, padding: '7px 14px' }}>
              {s ? STATUS_LABELS[s] : 'همه'}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden' }}>
        {(projects as any[]).length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>پروژه‌ای یافت نشد</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--b2)' }}>
                {['عنوان', 'مشتری', 'مسئول', 'وضعیت', 'اولویت', 'تاریخ', 'عملیات'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(projects as any[]).map(p => (
                <tr key={p._id.toString()} style={{ borderBottom: '1px solid var(--bd)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>{p.title}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--t2)' }}>
                    {p.customerId ? `${p.customerId.firstName} ${p.customerId.lastName}` : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--t2)' }}>
                    {p.assignedTo ? `${p.assignedTo.firstName} ${p.assignedTo.lastName}` : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[p.status] || 'var(--t3)' }}>{STATUS_LABELS[p.status] || p.status}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12.5, color: 'var(--t3)' }}>{p.priority || '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--t3)' }}>{new Date(p.createdAt).toLocaleDateString('fa-IR')}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <Link href={`/staff/projects/${p._id}`} className="site-btn site-btn-outline" style={{ fontSize: 12, padding: '5px 12px' }}>جزئیات</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
          {page > 1 && <Link href={buildUrl({ page: String(page - 1) })} className="site-btn site-btn-outline" style={{ fontSize: 12 }}>‹ قبلی</Link>}
          <span style={{ padding: '8px 14px', fontSize: 12.5, color: 'var(--t2)' }}>{page} / {pages}</span>
          {page < pages && <Link href={buildUrl({ page: String(page + 1) })} className="site-btn site-btn-outline" style={{ fontSize: 12 }}>بعدی ›</Link>}
        </div>
      )}
    </div>
  )
}
