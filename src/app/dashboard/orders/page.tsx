// src/app/dashboard/orders/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Order from '@/models/Order'
import Link from 'next/link'

const statusMap: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: 'در انتظار پرداخت', cls: 'yellow' },
  paid: { label: 'پرداخت شده', cls: 'blue' },
  in_progress: { label: 'در حال انجام', cls: 'blue' },
  completed: { label: 'تکمیل شده', cls: 'green' },
  cancelled: { label: 'لغو شده', cls: 'red' },
  refunded: { label: 'مرجوع شده', cls: 'red' },
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ payment?: string; order?: string; ref?: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/auth/login')

  const sp = await searchParams
  const paymentStatus = sp.payment
  const orderNum = sp.order
  const refId = sp.ref

  await connectDB()
  const orders = await Order.find({ userId: payload.userId }).sort('-createdAt').limit(50)

  return (
    <div className="db-page">
      {/* Payment result alerts */}
      {paymentStatus === 'success' && (
        <div className="db-alert db-alert-success">
          ✅ پرداخت سفارش <strong>{orderNum}</strong> موفق بود. کد پیگیری: <strong>{refId}</strong>
        </div>
      )}
      {paymentStatus === 'cancelled' && (
        <div className="db-alert db-alert-warn">
          پرداخت توسط شما لغو شد.
        </div>
      )}
      {paymentStatus === 'failed' && (
        <div className="db-alert db-alert-error">
          پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.
        </div>
      )}

      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">تمام سفارشات</div>
          <span style={{ fontSize: 12, color: 'var(--t3)' }}>{orders.length} سفارش</span>
        </div>
        {orders.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon">◈</div>
            <div className="db-empty-text">هنوز سفارشی ثبت نکرده‌اید</div>
            <Link href="/" className="db-btn db-btn-gold">مشاهده محصولات</Link>
          </div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>شماره سفارش</th>
                  <th>محصولات</th>
                  <th>مبلغ نهایی</th>
                  <th>تاریخ</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => {
                  const st = statusMap[order.status] || { label: order.status, cls: 'gray' }
                  const date = new Date(order.createdAt).toLocaleDateString('fa-IR')
                  return (
                    <tr key={order._id.toString()}>
                      <td className="db-table-mono">{order.orderNumber}</td>
                      <td>
                        {order.items[0]?.title}
                        {order.items.length > 1 && (
                          <span style={{ fontSize: 11, color: 'var(--t3)', marginRight: 6 }}>
                            +{order.items.length - 1} مورد
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--gold)', fontWeight: 800 }}>
                        {order.finalAmount.toLocaleString('fa')} ت
                      </td>
                      <td>{date}</td>
                      <td><span className={`db-badge db-badge-${st.cls}`}>{st.label}</span></td>
                      <td>
                        {order.status === 'pending_payment' && (
                          <a
                            href={`/api/orders/repay?orderId=${order._id}`}
                            className="db-btn db-btn-gold"
                            style={{ padding: '5px 12px', fontSize: 11 }}
                          >
                            پرداخت
                          </a>
                        )}
                        {order.status === 'completed' && (
                          <a
                            href={`/dashboard/orders/${order._id}`}
                            className="db-btn db-btn-outline"
                            style={{ padding: '5px 12px', fontSize: 11 }}
                          >
                            جزئیات
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
