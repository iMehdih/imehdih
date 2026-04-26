// src/app/admin/tickets/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Ticket from '@/models/Ticket'
import Link from 'next/link'

const statusMap: Record<string, { label: string; cls: string }> = {
  open: { label: 'در انتظار', cls: 'red' },
  in_review: { label: 'در بررسی', cls: 'blue' },
  waiting_info: { label: 'انتظار اطلاعات', cls: 'yellow' },
  in_progress: { label: 'در انجام', cls: 'blue' },
  answered: { label: 'پاسخ داده شده', cls: 'green' },
  special_handling: { label: 'رسیدگی ویژه', cls: 'gold' },
  waiting_payment: { label: 'انتظار پرداخت', cls: 'yellow' },
  resolved_pending_confirm: { label: 'حل شده', cls: 'green' },
  closed: { label: 'بسته', cls: 'gray' },
  cancelled: { label: 'لغو', cls: 'gray' },
}

const deptLabels: Record<string, string> = {
  support_theme_plugin: 'قالب/افزونه',
  support_course: 'دوره',
  support_hosting_domain: 'هاست/دامنه',
  support_service: 'خدمات',
  support_subscription: 'اشتراک',
  finance: 'مالی',
  service_support: 'پشتیبانی',
  presale: 'پیش از خرید',
  management: 'مدیریت',
}

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; dept?: string; page?: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  const sp = await searchParams
  const status = sp.status || ''
  const dept = sp.dept || ''
  const page = parseInt(sp.page || '1')
  const limit = 25

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  if (dept) filter.department = dept

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-messages')
      .populate('userId', 'firstName lastName mobile')
      .populate('assignedTo', 'firstName lastName')
      .lean(),
    Ticket.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / limit)

  const buildUrl = (params: Record<string, string>) => {
    const p = { ...( status && { status }), ...(dept && { dept }), ...params }
    return `/admin/tickets?${new URLSearchParams(p).toString()}`
  }

  return (
    <div className="admin-page">
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
          {[{ val: '', label: 'همه وضعیت‌ها' }, ...Object.entries(statusMap).map(([val, { label }]) => ({ val, label }))].map(s => (
            <a key={s.val} href={buildUrl({ status: s.val, page: '1' })}
              className={`admin-filter-btn ${status === s.val ? 'active' : ''}`}>
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Dept filter */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 16, flexWrap: 'wrap' }}>
        <a href={buildUrl({ dept: '', page: '1' })} className={`admin-filter-btn ${!dept ? 'active' : ''}`}>همه دپارتمان‌ها</a>
        {Object.entries(deptLabels).map(([val, label]) => (
          <a key={val} href={buildUrl({ dept: val, page: '1' })} className={`admin-filter-btn ${dept === val ? 'active' : ''}`}>
            {label}
          </a>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div className="admin-card-title">تیکت‌ها ({total})</div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>شماره</th>
                <th>مشتری</th>
                <th>عنوان</th>
                <th>دپارتمان</th>
                <th>کارشناس</th>
                <th>تاریخ</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {(tickets as any[]).map(t => {
                const st = statusMap[t.status] || { label: t.status, cls: 'gray' }
                const u = t.userId
                const isOpen = !['closed', 'cancelled'].includes(t.status) && !t.assignedTo
                return (
                  <tr key={t._id.toString()}>
                    <td className="admin-table-mono" style={{ fontSize: 11 }}>{t.ticketNumber}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u?.firstName ? `${u.firstName} ${u.lastName}` : '—'}</div>
                      <div style={{ fontSize: 10.5, color: '#505062' }}>{u?.mobile}</div>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isOpen && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#EF4444', marginLeft: 5, verticalAlign: 'middle' }}></span>}
                        {t.title}
                      </div>
                      {t.relatedDomain && <div style={{ fontSize: 10.5, color: '#505062' }}>{t.relatedDomain}</div>}
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-gray" style={{ fontSize: 9.5 }}>
                        {deptLabels[t.department] || t.department}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : (
                        <span style={{ color: '#EF4444', fontSize: 11 }}>بدون assign</span>
                      )}
                    </td>
                    <td style={{ fontSize: 11 }}>{new Date(t.createdAt).toLocaleDateString('fa-IR')}</td>
                    <td><span className={`admin-badge admin-badge-${st.cls}`}>{st.label}</span></td>
                    <td>
                      <Link href={`/admin/tickets/${t._id}`} className="admin-btn-sm">
                        بررسی
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6, justifyContent: 'center' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <a key={p} href={buildUrl({ page: String(p) })}
                style={{
                  padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 700, textDecoration: 'none',
                  background: p === page ? '#C8A96E' : '#141420',
                  color: p === page ? '#000' : '#8888A0',
                  border: `1px solid ${p === page ? '#C8A96E' : 'rgba(255,255,255,0.06)'}`,
                }}>
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
