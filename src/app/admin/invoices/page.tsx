// src/app/admin/invoices/page.tsx
import { connectDB } from '@/lib/db/mongoose'
import Order from '@/models/Order'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'در انتظار پرداخت', paid: 'پرداخت شده',
  in_progress: 'در حال انجام', completed: 'تکمیل شده',
  cancelled: 'لغو شده', refunded: 'بازگشت وجه',
}
const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'var(--t3)', paid: 'var(--green)', in_progress: 'var(--gold)',
  completed: 'var(--blue)', cancelled: 'var(--red)', refunded: 'var(--red)',
}

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page || 1))
  const q = sp.q || ''
  const statusFilter = sp.status || ''
  const limit = 25

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (statusFilter) filter.status = statusFilter
  if (q) filter.orderNumber = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit)
      .populate('userId', 'firstName lastName mobile')
      .lean(),
    Order.countDocuments(filter),
  ])

  const pages = Math.ceil(total / limit)

  const buildUrl = (params: Record<string, string>) => {
    const p = { ...(statusFilter && { status: statusFilter }), ...(q && { q }), ...params }
    return `/admin/invoices?${new URLSearchParams(p)}`
  }

  return (
    <div className="db-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>فاکتورها</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{total.toLocaleString('fa')} سفارش</p>
        </div>
        <form method="GET" style={{ display: 'flex', gap: 8 }}>
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input className="form-input" name="q" defaultValue={q} placeholder="شماره سفارش..." style={{ minWidth: 180, direction: 'ltr' }} />
          <button type="submit" className="site-btn site-btn-gold" style={{ fontSize: 13, padding: '8px 14px' }}>جستجو</button>
        </form>
      </div>

      {/* Status filter tabs */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {[['', 'همه'], ['paid', 'پرداخت شده'], ['in_progress', 'در حال انجام'], ['completed', 'تکمیل شده'], ['pending_payment', 'در انتظار'], ['cancelled', 'لغو شده']].map(([v, l]) => (
          <Link key={v} href={buildUrl(v ? { status: v, page: '1' } : { page: '1' })} className={`filter-tab ${statusFilter === v ? 'active' : ''}`}>{l}</Link>
        ))}
      </div>

      <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden' }}>
        {orders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>سفارشی یافت نشد</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--b2)' }}>
                {['شماره', 'مشتری', 'مبلغ نهایی', 'وضعیت', 'تاریخ'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(orders as any[]).map(o => (
                <tr key={o._id.toString()} style={{ borderBottom: '1px solid var(--bd)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <code style={{ fontSize: 12.5, color: 'var(--gold)', fontWeight: 700, direction: 'ltr', display: 'inline-block' }}>{o.orderNumber}</code>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>
                    {o.userId ? `${o.userId.firstName} ${o.userId.lastName}` : '—'}
                    {o.userId?.mobile && <div style={{ fontSize: 11, color: 'var(--t3)', direction: 'ltr' }}>{o.userId.mobile}</div>}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                    {o.finalAmount === 0 ? <span style={{ color: 'var(--green)' }}>رایگان</span> : `${o.finalAmount.toLocaleString('fa')} ت`}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[o.status] || 'var(--t3)' }}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--t3)' }}>
                    {new Date(o.createdAt).toLocaleDateString('fa-IR')}
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
