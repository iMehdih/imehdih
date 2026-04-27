// src/app/staff/tickets/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Ticket from '@/models/Ticket'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = { open: 'باز', in_progress: 'در حال بررسی', waiting_customer: 'منتظر مشتری', closed: 'بسته', cancelled: 'لغو شده' }
const STATUS_COLORS: Record<string, string> = { open: 'var(--green)', in_progress: 'var(--gold)', waiting_customer: 'var(--blue)', closed: 'var(--t3)', cancelled: 'var(--red)' }

export default async function StaffTicketsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'staff') redirect('/auth/login')

  await connectDB()

  const tickets = await Ticket.find({ assignedTo: payload.userId })
    .populate('customerId', 'firstName lastName mobile')
    .sort('-updatedAt').limit(50).lean()

  const open = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length

  return (
    <div className="db-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>تیکت‌های من</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{open} تیکت باز از {tickets.length} کل</p>
      </div>

      {tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✉</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>هیچ تیکتی به شما اختصاص داده نشده</div>
        </div>
      ) : (
        <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--b2)' }}>
                {['موضوع', 'مشتری', 'وضعیت', 'دپارتمان', 'آخرین بروزرسانی', 'عملیات'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(tickets as any[]).map(t => (
                <tr key={t._id.toString()} style={{ borderBottom: '1px solid var(--bd)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, maxWidth: 200 }}>{t.subject}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--t2)' }}>
                    {t.customerId ? `${t.customerId.firstName} ${t.customerId.lastName}` : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[t.status] || 'var(--t3)' }}>
                      {STATUS_LABELS[t.status] || t.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12.5, color: 'var(--t3)' }}>{t.department || '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12.5, color: 'var(--t3)' }}>
                    {new Date(t.updatedAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Link href={`/admin/tickets/${t._id}`} className="site-btn site-btn-outline" style={{ fontSize: 12, padding: '5px 12px' }}>
                      مشاهده
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
