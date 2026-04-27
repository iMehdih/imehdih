// src/app/dashboard/invoices/[orderNumber]/page.tsx
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Order from '@/models/Order'
import User from '@/models/User'
import type { Metadata } from 'next'
import PrintButton from '@/components/ui/PrintButton'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}): Promise<Metadata> {
  const { orderNumber } = await params
  return { title: `فاکتور ${orderNumber}` }
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'در انتظار پرداخت', paid: 'پرداخت شده',
  in_progress: 'در حال انجام', completed: 'تکمیل شده',
  cancelled: 'لغو شده', refunded: 'بازگشت وجه',
}

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params

  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/auth/login')

  await connectDB()

  const order = await Order.findOne({ orderNumber }).lean()
  if (!order) notFound()

  const o = order as any
  // مشتری فقط فاکتور خودش رو ببینه
  if (payload.role === 'customer' && o.userId.toString() !== payload.userId) notFound()

  const user = await User.findById(o.userId).select('firstName lastName email mobile').lean() as any

  return (
    <div className="invoice-wrap">
      {/* Print button — only visible on screen */}
      <div className="invoice-print-btn no-print">
        <PrintButton />
      </div>

      <div className="invoice-page">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 20, borderBottom: '2px solid #222' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#c8a96e' }}>مهدی حاتم‌پور</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>پلتفرم وردپرس و خدمات دیجیتال</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>imehdih.ir</div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>فاکتور</div>
            <div style={{ fontSize: 13, color: '#888' }}>شماره: <strong style={{ color: '#c8a96e', direction: 'ltr', display: 'inline-block' }}>{o.orderNumber}</strong></div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>تاریخ: {new Date(o.createdAt).toLocaleDateString('fa-IR')}</div>
            {o.paidAt && <div style={{ fontSize: 12, color: '#888' }}>پرداخت: {new Date(o.paidAt).toLocaleDateString('fa-IR')}</div>}
          </div>
        </div>

        {/* Customer info */}
        <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '14px 18px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>مشتری</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{user?.firstName} {user?.lastName}</div>
          {user?.email && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{user.email}</div>}
          {user?.mobile && <div style={{ fontSize: 12, color: '#888', marginTop: 2, direction: 'ltr', display: 'inline-block' }}>{user.mobile}</div>}
        </div>

        {/* Items table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#111', borderBottom: '1px solid #333' }}>
              {['ردیف', 'محصول/خدمت', 'قیمت واحد', 'مبلغ پرداختی'].map(h => (
                <th key={h} style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: '#888', textAlign: 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(o.items as any[]).map((item: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#666' }}>{i + 1}</td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#ddd', fontWeight: 600 }}>{item.title}</td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#888', direction: 'ltr', textAlign: 'right' }}>
                  {item.price > 0 ? `${item.price.toLocaleString('fa')} ت` : 'رایگان'}
                </td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#fff', fontWeight: 700, direction: 'ltr', textAlign: 'right' }}>
                  {item.discountedPrice > 0 ? `${item.discountedPrice.toLocaleString('fa')} ت` : 'رایگان'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <div style={{ minWidth: 260 }}>
            {o.discountAmount > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                  <span style={{ color: '#888' }}>جمع کل</span>
                  <span style={{ color: '#aaa', direction: 'ltr' }}>{o.subtotal.toLocaleString('fa')} ت</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                  <span style={{ color: '#888' }}>تخفیف{o.couponCode ? ` (${o.couponCode})` : ''}</span>
                  <span style={{ color: '#e74c3c', direction: 'ltr' }}>- {o.discountAmount.toLocaleString('fa')} ت</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #333', fontSize: 16, fontWeight: 900 }}>
              <span style={{ color: '#ddd' }}>مبلغ نهایی</span>
              <span style={{ color: '#c8a96e', direction: 'ltr' }}>
                {o.finalAmount === 0 ? 'رایگان' : `${o.finalAmount.toLocaleString('fa')} تومان`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
              <span style={{ color: '#666' }}>وضعیت</span>
              <span style={{ color: o.status === 'paid' || o.status === 'completed' ? '#2ecc71' : '#888' }}>
                {STATUS_LABELS[o.status] || o.status}
              </span>
            </div>
            {o.paymentRef && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                <span style={{ color: '#666' }}>کد پیگیری</span>
                <span style={{ color: '#888', direction: 'ltr', fontSize: 11 }}>{o.paymentRef}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #222', paddingTop: 16, textAlign: 'center', fontSize: 12, color: '#555' }}>
          <p style={{ margin: '0 0 4px' }}>این فاکتور به صورت الکترونیکی صادر شده و نیازی به مهر و امضا ندارد.</p>
          <p style={{ margin: 0 }}>پلتفرم مهدی حاتم‌پور — imehdih.ir</p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .invoice-wrap { background: #fff !important; }
          .invoice-page { color: #000 !important; }
        }
        .invoice-wrap { min-height: 100vh; background: #0d0d0d; padding: 32px; }
        .invoice-page { max-width: 800px; margin: 0 auto; background: #111; border-radius: 12px; padding: 40px; border: 1px solid #222; }
        .invoice-print-btn { max-width: 800px; margin: 0 auto 16px; display: flex; justify-content: flex-end; }
      `}</style>
    </div>
  )
}
