// src/app/admin/tickets/[id]/page.tsx
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Ticket from '@/models/Ticket'
import User from '@/models/User'
import Order from '@/models/Order'
import AdminTicketActions from '@/components/admin/AdminTicketActions'

const statusMap: Record<string, { label: string; cls: string }> = {
  open: { label: 'در انتظار بررسی', cls: 'red' },
  in_review: { label: 'در حال بررسی', cls: 'blue' },
  waiting_info: { label: 'در انتظار اطلاعات', cls: 'yellow' },
  in_progress: { label: 'در حال انجام', cls: 'blue' },
  answered: { label: 'پاسخ داده شده', cls: 'green' },
  special_handling: { label: 'رسیدگی ویژه', cls: 'gold' },
  waiting_payment: { label: 'در انتظار پرداخت', cls: 'yellow' },
  resolved_pending_confirm: { label: 'حل شده — در انتظار تأیید', cls: 'green' },
  closed: { label: 'بسته شده', cls: 'gray' },
  cancelled: { label: 'لغو شده', cls: 'gray' },
}

const deptLabels: Record<string, string> = {
  support_theme_plugin: 'پشتیبانی قالب/افزونه',
  support_course: 'پشتیبانی دوره آموزشی',
  support_hosting_domain: 'پشتیبانی هاست/دامنه',
  support_service: 'پشتیبانی خدمات',
  support_subscription: 'پشتیبانی اشتراک Pro',
  finance: 'واحد مالی',
  service_support: 'پشتیبانی خدمات پروژه‌ای',
  presale: 'سوالات پیش از خرید',
  management: 'ارتباط با مدیریت',
}

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  const { id } = await params
  await connectDB()

  const ticket = await Ticket.findById(id)
    .populate('userId', 'firstName lastName mobile email customerScore isVIP')
    .populate('assignedTo', 'firstName lastName')
    .lean()

  if (!ticket) redirect('/admin/tickets')

  const t = ticket as any
  const st = statusMap[t.status] || { label: t.status, cls: 'gray' }

  // سابقه تیکت‌های این مشتری (بدون تیکت جاری)
  const previousTickets = await Ticket.find({
    userId: t.userId?._id,
    _id: { $ne: id },
  })
    .sort('-createdAt')
    .limit(10)
    .select('ticketNumber title status createdAt')
    .lean()

  // آخرین سفارشات مشتری
  const customerOrders = await Order.find({ userId: t.userId?._id })
    .sort('-createdAt')
    .limit(5)
    .select('orderNumber items finalAmount status createdAt')
    .lean()

  // serialize
  const messages = t.messages.map((m: any) => ({
    _id: m._id?.toString(),
    senderId: m.senderId?.toString(),
    senderRole: m.senderRole,
    content: m.content,
    attachments: m.attachments || [],
    createdAt: m.createdAt?.toISOString(),
    senderName: m.senderRole === 'customer' ? (t.userId?.firstName || 'مشتری') : 'پشتیبانی',
  }))

  const customer = t.userId
  const isClosed = ['closed', 'cancelled'].includes(t.status)
  const isAssignedToMe = t.assignedTo && t.assignedTo._id?.toString() === payload.userId

  return (
    <div className="admin-page">
      {/* Back */}
      <Link href="/admin/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--t2)', marginBottom: 16, textDecoration: 'none' }}>
        ← بازگشت به لیست
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

        {/* ── Main: Ticket + Chat ── */}
        <div>
          {/* Ticket Header */}
          <div className="admin-card" style={{ marginBottom: 14 }}>
            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span className={`admin-badge admin-badge-${st.cls}`}>{st.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>#{t.ticketNumber}</span>
                    <span className="admin-badge admin-badge-gray" style={{ fontSize: 9.5 }}>
                      {deptLabels[t.department] || t.department}
                    </span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>{t.title}</div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: 'var(--t3)', flexWrap: 'wrap' }}>
                    <span>ثبت: {new Date(t.createdAt).toLocaleString('fa-IR')}</span>
                    {t.relatedDomain && (
                      <span>دامنه: <strong style={{ color: 'var(--gold)' }}>{t.relatedDomain}</strong></span>
                    )}
                    {t.assignedTo && (
                      <span>کارشناس: <strong style={{ color: 'var(--t)' }}>{t.assignedTo.firstName} {t.assignedTo.lastName}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
            {messages.map((msg: any, i: number) => {
              const isStaff = msg.senderRole !== 'customer'
              return (
                <div key={i} style={{
                  background: 'var(--b1)', border: `1px solid ${isStaff ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '10px 16px', background: isStaff ? 'rgba(96,165,250,0.06)' : 'rgba(200,169,110,0.04)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: isStaff ? 'rgba(96,165,250,0.15)' : 'rgba(200,169,110,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 900,
                      color: isStaff ? 'var(--blue)' : 'var(--gold)', flexShrink: 0,
                    }}>
                      {isStaff ? 'پ' : 'م'}
                    </div>
                    <div>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: isStaff ? 'var(--blue)' : 'var(--gold)' }}>
                        {msg.senderName}
                      </span>
                      <span style={{ fontSize: 10.5, color: 'var(--t3)', marginRight: 8 }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString('fa-IR') : ''}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px', fontSize: 13.5, color: 'var(--t)', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Actions (Client Component) */}
          <AdminTicketActions
            ticketId={id}
            currentStatus={t.status}
            isAssigned={!!t.assignedTo}
            isAssignedToMe={isAssignedToMe}
            staffId={payload.userId}
            isClosed={isClosed}
          />
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Customer Info */}
          <div className="admin-card">
            <div className="admin-card-head">
              <div className="admin-card-title">اطلاعات مشتری</div>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {customer && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold3))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, flexShrink: 0 }}>
                      {customer.firstName?.[0] || customer.mobile?.[2]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>
                        {customer.firstName ? `${customer.firstName} ${customer.lastName}` : 'تکمیل نشده'}
                        {customer.isVIP && <span style={{ fontSize: 9, fontWeight: 900, background: 'var(--gold)', color: '#000', padding: '1px 6px', borderRadius: 100, marginRight: 5 }}>VIP</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>{customer.mobile}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--t3)' }}>امتیاز</span>
                    <span style={{ fontWeight: 700 }}>{customer.customerScore}/100</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Previous Tickets */}
          <div className="admin-card">
            <div className="admin-card-head">
              <div className="admin-card-title">سابقه تیکت‌ها</div>
              <span style={{ fontSize: 10.5, color: 'var(--t3)' }}>{(previousTickets as any[]).length} تیکت</span>
            </div>
            <div>
              {(previousTickets as any[]).length === 0 ? (
                <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--t3)' }}>تیکت قبلی ندارد</div>
              ) : (previousTickets as any[]).map(pt => {
                const ps = statusMap[pt.status] || { label: pt.status, cls: 'gray' }
                return (
                  <a key={pt._id.toString()} href={`/admin/tickets/${pt._id}`}
                    style={{ display: 'block', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontSize: 12.5, color: 'var(--t)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {pt.title}
                      </div>
                      <span className={`admin-badge admin-badge-${ps.cls}`} style={{ fontSize: 9, flexShrink: 0 }}>
                        {ps.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--t3)', marginTop: 3 }}>
                      #{pt.ticketNumber} · {new Date(pt.createdAt).toLocaleDateString('fa-IR')}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="admin-card">
            <div className="admin-card-head">
              <div className="admin-card-title">آخرین سفارشات</div>
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(customerOrders as any[]).map(o => (
                <div key={o._id.toString()} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{o.items?.[0]?.title}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--t3)' }}>#{o.orderNumber}</div>
                  </div>
                  <div style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 11.5 }}>
                    {(o.finalAmount / 1000).toFixed(0)}ک
                  </div>
                </div>
              ))}
              {(customerOrders as any[]).length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--t3)' }}>سفارشی ندارد</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
