// src/app/admin/domains/page.tsx
import { connectDB } from '@/lib/db/mongoose'
import Domain from '@/models/Domain'
import Link from 'next/link'

export default async function AdminDomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page || 1))
  const q = sp.q || ''
  const limit = 25

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (q) filter.domain = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }

  const [domains, total] = await Promise.all([
    Domain.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit)
      .populate('userId', 'firstName lastName mobile')
      .populate('productId', 'title slug')
      .lean(),
    Domain.countDocuments(filter),
  ])

  const pages = Math.ceil(total / limit)

  return (
    <div className="db-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>دامنه‌ها</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{total} دامنه ثبت‌شده</p>
        </div>
        <form method="GET" style={{ display: 'flex', gap: 8 }}>
          <input className="form-input" name="q" defaultValue={q} placeholder="جستجوی دامنه..." style={{ minWidth: 220 }} />
          <button type="submit" className="site-btn site-btn-gold" style={{ fontSize: 13, padding: '8px 14px' }}>جستجو</button>
        </form>
      </div>

      <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden' }}>
        {domains.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>دامنه‌ای یافت نشد</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--b2)' }}>
                {['دامنه', 'کاربر', 'محصول', 'تعداد تغییر', 'تاریخ ثبت'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(domains as any[]).map(d => (
                <tr key={d._id.toString()} style={{ borderBottom: '1px solid var(--bd)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <code style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>{d.domain}</code>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--t2)' }}>
                    {d.userId ? `${d.userId.firstName} ${d.userId.lastName}` : '—'}
                    {d.userId?.mobile && <div style={{ fontSize: 11, color: 'var(--t3)', direction: 'ltr' }}>{d.userId.mobile}</div>}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>
                    {d.productId ? (
                      <Link href={`/products/${d.productId.slug}`} style={{ color: 'var(--t)', textDecoration: 'none' }} target="_blank">
                        {d.productId.title}
                      </Link>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: d.changeCount >= 3 ? 'var(--red)' : 'var(--t)' }}>
                      {d.changeCount} / ۳
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--t3)' }}>
                    {new Date(d.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
          {page > 1 && <Link href={`/admin/domains?page=${page - 1}${q ? `&q=${q}` : ''}`} className="site-btn site-btn-outline" style={{ fontSize: 12 }}>‹ قبلی</Link>}
          <span style={{ padding: '8px 14px', fontSize: 12.5, color: 'var(--t2)' }}>{page} / {pages}</span>
          {page < pages && <Link href={`/admin/domains?page=${page + 1}${q ? `&q=${q}` : ''}`} className="site-btn site-btn-outline" style={{ fontSize: 12 }}>بعدی ›</Link>}
        </div>
      )}
    </div>
  )
}
