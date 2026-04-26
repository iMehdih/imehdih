// src/app/dashboard/tickets/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Ticket from '@/models/Ticket'
import Link from 'next/link'

const statusMap: Record<string, { label: string; cls: string }> = {
  open: { label: 'در انتظار بررسی', cls: 'red' },
  in_review: { label: 'در حال بررسی', cls: 'blue' },
  waiting_info: { label: 'در انتظار اطلاعات', cls: 'yellow' },
  in_progress: { label: 'در حال انجام', cls: 'blue' },
  answered: { label: 'پاسخ داده شده', cls: 'green' },
  special_handling: { label: 'رسیدگی ویژه', cls: 'gold' },
  waiting_payment: { label: 'در انتظار پرداخت', cls: 'yellow' },
  resolved_pending_confirm: { label: 'حل شده', cls: 'green' },
  closed: { label: 'بسته شده', cls: 'gray' },
  cancelled: { label: 'لغو شده', cls: 'gray' },
}

const deptLabels: Record<string, string> = {
  support_theme_plugin: 'قالب و افزونه',
  support_course: 'دوره آموزشی',
  support_hosting_domain: 'هاست و دامنه',
  support_service: 'خدمات',
  support_subscription: 'اشتراک Pro',
  finance: 'مالی',
  service_support: 'پشتیبانی خدمات',
  presale: 'پیش از خرید',
  management: 'مدیریت',
}

export default async function CustomerTicketsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  await connectDB()
  const tickets = await Ticket.find({ userId: payload.userId })
    .sort('-createdAt')
    .select('-messages')
    .lean()

  const openCount = tickets.filter(t => !['closed', 'cancelled'].includes(t.status)).length

  return (
    <div className="db-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: '#505062', marginTop: 4 }}>
            {openCount} تیکت باز · {tickets.length} تیکت کل
          </div>
        </div>
        <Link href="/dashboard/tickets/new" className="db-btn db-btn-gold">
          + تیکت جدید
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="db-card">
          <div className="db-empty">
            <div className="db-empty-icon">✉</div>
            <div className="db-empty-text">هنوز تیکتی ثبت نکرده‌اید</div>
            <Link href="/dashboard/tickets/new" className="db-btn db-btn-gold" style={{ marginTop: 8 }}>
              ثبت اولین تیکت
            </Link>
          </div>
        </div>
      ) : (
        <div className="db-card">
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>شماره</th>
                  <th>عنوان</th>
                  <th>دپارتمان</th>
                  <th>تاریخ</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {(tickets as any[]).map(ticket => {
                  const st = statusMap[ticket.status] || { label: ticket.status, cls: 'gray' }
                  const isOpen = !['closed', 'cancelled'].includes(ticket.status)
                  return (
                    <tr key={ticket._id.toString()}>
                      <td className="db-table-mono" style={{ fontSize: 11.5 }}>{ticket.ticketNumber}</td>
                      <td style={{ fontWeight: 700, maxWidth: 300 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {isOpen && <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#EF4444', marginLeft: 6, verticalAlign: 'middle' }}></span>}
                          {ticket.title}
                        </div>
                        {ticket.relatedDomain && (
                          <div style={{ fontSize: 10.5, color: '#505062', marginTop: 2 }}>{ticket.relatedDomain}</div>
                        )}
                      </td>
                      <td style={{ fontSize: 11.5 }}>{deptLabels[ticket.department] || ticket.department}</td>
                      <td style={{ fontSize: 11.5 }}>{new Date(ticket.createdAt).toLocaleDateString('fa-IR')}</td>
                      <td><span className={`db-badge db-badge-${st.cls}`}>{st.label}</span></td>
                      <td>
                        <Link href={`/dashboard/tickets/${ticket._id}`} className="db-btn db-btn-outline" style={{ padding: '5px 12px', fontSize: 11.5 }}>
                          مشاهده
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
