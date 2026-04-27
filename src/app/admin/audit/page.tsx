// src/app/admin/audit/page.tsx
import { connectDB } from '@/lib/db/mongoose'
import AuditLog from '@/models/AuditLog'

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; entity?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page || 1))
  const limit = 30
  const actionFilter = sp.action || ''
  const entityFilter = sp.entity || ''

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (actionFilter) filter.action = actionFilter
  if (entityFilter) filter.entity = entityFilter

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit)
      .populate('userId', 'firstName lastName role')
      .lean(),
    AuditLog.countDocuments(filter),
  ])

  const pages = Math.ceil(total / limit)

  return (
    <div className="db-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Audit Log</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{total.toLocaleString('fa')} رویداد ثبت شده</p>
      </div>

      <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden' }}>
        {(logs as any[]).length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>رویداد ثبت نشده</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--b2)' }}>
                {['زمان', 'کاربر', 'عملیات', 'موجودیت', 'IP'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(logs as any[]).map(l => (
                <tr key={l._id.toString()} style={{ borderBottom: '1px solid var(--bd)' }}>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--t3)', whiteSpace: 'nowrap' }}>
                    {new Date(l.createdAt).toLocaleString('fa-IR')}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12.5 }}>
                    {l.userId ? `${l.userId.firstName} ${l.userId.lastName}` : '—'}
                    {l.userRole && <span style={{ fontSize: 10.5, color: 'var(--t3)', marginRight: 6 }}>({l.userRole})</span>}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <code style={{ fontSize: 11.5, background: 'var(--b2)', padding: '2px 8px', borderRadius: 5, color: 'var(--gold)' }}>{l.action}</code>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--t2)' }}>
                    {l.entity}
                    {l.entityId && <span style={{ fontSize: 11, color: 'var(--t3)', marginRight: 4 }}>#{l.entityId.toString().slice(-6)}</span>}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--t3)', direction: 'ltr' }}>{l.ip || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
          {page > 1 && (
            <a href={`/admin/audit?page=${page - 1}${actionFilter ? `&action=${actionFilter}` : ''}`} className="site-btn site-btn-outline" style={{ fontSize: 12 }}>‹ قبلی</a>
          )}
          <span style={{ padding: '8px 14px', fontSize: 12.5, color: 'var(--t2)' }}>{page} / {pages}</span>
          {page < pages && (
            <a href={`/admin/audit?page=${page + 1}${actionFilter ? `&action=${actionFilter}` : ''}`} className="site-btn site-btn-outline" style={{ fontSize: 12 }}>بعدی ›</a>
          )}
        </div>
      )}
    </div>
  )
}
