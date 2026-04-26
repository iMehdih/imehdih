// src/app/dashboard/tickets/[id]/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Link from 'next/link'
import Ticket from '@/models/Ticket'
import TicketChat from '@/components/dashboard/TicketChat'

const statusMap: Record<string, { label: string; cls: string }> = {
  open: { label: 'در انتظار بررسی', cls: 'red' },
  in_review: { label: 'در حال بررسی', cls: 'blue' },
  waiting_info: { label: 'در انتظار اطلاعات', cls: 'yellow' },
  in_progress: { label: 'در حال انجام', cls: 'blue' },
  answered: { label: 'پاسخ داده شده', cls: 'green' },
  special_handling: { label: 'رسیدگی ویژه', cls: 'gold' },
  waiting_payment: { label: 'در انتظار پرداخت', cls: 'yellow' },
  resolved_pending_confirm: { label: 'حل شده — در انتظار تأیید شما', cls: 'green' },
  closed: { label: 'بسته شده', cls: 'gray' },
  cancelled: { label: 'لغو شده', cls: 'gray' },
}

export default async function TicketDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  const { id } = await params
  const sp = await searchParams
  const justCreated = sp.created === '1'

  await connectDB()

  const ticket = await Ticket.findOne({ _id: id, userId: payload.userId })
    .populate('assignedTo', 'firstName lastName')
    .lean()

  if (!ticket) redirect('/dashboard/tickets')

  const t = ticket as any
  const st = statusMap[t.status] || { label: t.status, cls: 'gray' }
  const isClosed = ['closed', 'cancelled'].includes(t.status)

  // serialize پیام‌ها برای Client Component
  const messages = t.messages.map((m: any) => ({
    _id: m._id?.toString(),
    senderId: m.senderId?.toString(),
    senderRole: m.senderRole,
    content: m.content,
    attachments: m.attachments || [],
    createdAt: m.createdAt?.toISOString(),
  }))

  return (
    <div className="db-page">
      {justCreated && (
        <div className="db-alert db-alert-success" style={{ marginBottom: 20 }}>
          ✅ تیکت با موفقیت ثبت شد. معمولاً ظرف ۴۵ دقیقه پاسخ می‌گیرید.
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className={`db-badge db-badge-${st.cls}`}>{st.label}</span>
              <span style={{ fontSize: 11.5, color: 'var(--t3)' }}>#{t.ticketNumber}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>{t.title}</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--t3)', flexWrap: 'wrap' }}>
              <span>تاریخ ثبت: {new Date(t.createdAt).toLocaleDateString('fa-IR')}</span>
              {t.assignedTo && <span>کارشناس: {t.assignedTo.firstName} {t.assignedTo.lastName}</span>}
              {t.relatedDomain && <span>دامنه: <strong style={{ color: 'var(--t)' }}>{t.relatedDomain}</strong></span>}
            </div>
          </div>
          <Link href="/dashboard/tickets" className="db-btn db-btn-outline" style={{ fontSize: 12, padding: '7px 14px' }}>
            ← بازگشت
          </Link>
        </div>

        {isClosed && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 12.5, color: 'var(--t3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>این تیکت بسته شده. برای پیگیری مجدد تیکت جدید بزنید.</span>
            <Link href="/dashboard/tickets/new" className="db-btn db-btn-gold" style={{ fontSize: 11, padding: '6px 14px' }}>
              تیکت جدید
            </Link>
          </div>
        )}
      </div>

      {/* Chat */}
      <TicketChat
        ticketId={id}
        messages={messages}
        userId={payload.userId}
        isClosed={isClosed}
      />
    </div>
  )
}
