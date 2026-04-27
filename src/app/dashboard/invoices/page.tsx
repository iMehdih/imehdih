// src/app/dashboard/invoices/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
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

export default async function DashboardInvoicesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  await connectDB()

  const orders = await Order.find({ userId: payload.userId }).sort('-createdAt').lean()

  const totalPaid = (orders as any[])
    .filter(o => o.status === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + o.finalAmount, 0)

  return (
    <div className="db-page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>فاکتورها</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{orders.length} سفارش</p>
        </div>
        {totalPaid > 0 && (
          <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', marginBottom: 4 }}>مجموع خریدها</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--gold)' }}>{totalPaid.toLocaleString('fa')} ت</div>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>▣</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>فاکتوری وجود ندارد</div>
          <Link href="/themes" className="site-btn site-btn-gold" style={{ fontSize: 14, padding: '11px 24px' }}>مشاهده محصولات</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(orders as any[]).map(o => (
            <div key={o._id.toString()} style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <code style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700, direction: 'ltr', display: 'inline-block' }}>{o.orderNumber}</code>
                  <span style={{ marginRight: 10, fontSize: 12, color: 'var(--t3)' }}>{new Date(o.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: STATUS_COLORS[o.status] || 'var(--t3)' }}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 900 }}>
                    {o.finalAmount === 0 ? <span style={{ color: 'var(--green)' }}>رایگان</span> : `${o.finalAmount.toLocaleString('fa')} ت`}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {o.items.map((item: any, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--t2)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.title}</span>
                    <span style={{ color: 'var(--t3)' }}>{item.discountedPrice > 0 ? `${item.discountedPrice.toLocaleString('fa')} ت` : 'رایگان'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
