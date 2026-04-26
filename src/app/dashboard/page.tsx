// src/app/dashboard/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import Order from '@/models/Order'
import Ticket from '@/models/Ticket'
import Notification from '@/models/Notification'
import Link from 'next/link'

const statusMap: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: 'انتظار پرداخت', cls: 'yellow' },
  paid: { label: 'پرداخت شده', cls: 'blue' },
  in_progress: { label: 'در حال انجام', cls: 'blue' },
  completed: { label: 'تکمیل شده', cls: 'green' },
  cancelled: { label: 'لغو شده', cls: 'red' },
  refunded: { label: 'مرجوع شده', cls: 'red' },
}

const ticketStatusMap: Record<string, { label: string; cls: string }> = {
  open: { label: 'باز', cls: 'red' },
  in_review: { label: 'در بررسی', cls: 'blue' },
  in_progress: { label: 'در انجام', cls: 'blue' },
  waiting_info: { label: 'انتظار اطلاعات', cls: 'yellow' },
  answered: { label: 'پاسخ داده شده', cls: 'green' },
  special_handling: { label: 'رسیدگی ویژه', cls: 'gold' },
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  await connectDB()
  const user = await User.findById(payload.userId)
    .select('firstName isProfileComplete isVIP customerScore')
    .lean()
  if (!user || !user.isProfileComplete) redirect('/dashboard/complete-profile')

  const [totalOrders, openTickets, unreadNotifs, recentOrders, recentTickets] = await Promise.all([
    Order.countDocuments({ userId: payload.userId }),
    Ticket.countDocuments({ userId: payload.userId, status: { $nin: ['closed', 'cancelled'] } }),
    Notification.countDocuments({ userId: payload.userId, isRead: false }),
    Order.find({ userId: payload.userId }).sort('-createdAt').limit(5).lean(),
    Ticket.find({ userId: payload.userId, status: { $nin: ['closed', 'cancelled'] } })
      .sort('-createdAt').limit(4).lean(),
  ])

  // سرویس‌های فعال (از سفارشات تکمیل‌شده)
  const activeServices = (recentOrders as any[]).filter(o =>
    ['paid', 'in_progress', 'completed'].includes(o.status) &&
    o.items?.some((i: any) => ['hosting', 'domain', 'subscription_pro', 'service_recurring'].includes(i.productType))
  )

  // دوره‌های فعال (از سفارشات تکمیل‌شده)
  const activeCourses = (recentOrders as any[]).filter(o =>
    o.status === 'completed' &&
    o.items?.some((i: any) => i.productType === 'course')
  ).slice(0, 3)

  const totalDownloads = 12 // placeholder

  return (
    <div className="db-page">
      {/* Welcome */}
      <div className="db-welcome">
        <div className="db-welcome-text">
          سلام <strong>{(user as any).firstName}</strong> عزیز 👋
        </div>
        <div className="db-welcome-sub">خوش اومدی به پنل کاربری‌ات</div>
      </div>

      {/* Stats */}
      <div className="db-stats-grid">
        <div className="db-stat-card">
          <div className="db-stat-icon">◈</div>
          <div className="db-stat-val">{totalOrders}</div>
          <div className="db-stat-lbl">سفارش کل</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon">✉</div>
          <div className="db-stat-val">{openTickets}</div>
          <div className="db-stat-lbl">تیکت باز</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon">◉</div>
          <div className="db-stat-val">{activeServices.length || 3}</div>
          <div className="db-stat-lbl">سرویس فعال</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon">↓</div>
          <div className="db-stat-val">{totalDownloads}</div>
          <div className="db-stat-lbl">دانلود باقی‌مانده</div>
        </div>
      </div>

      {/* Row 1: Orders + Active Services */}
      <div className="db-2col" style={{ marginBottom: 16 }}>
        {/* Recent Orders */}
        <div className="db-card">
          <div className="db-card-head">
            <div className="db-card-title">آخرین سفارشات</div>
            <Link href="/dashboard/orders" className="db-card-link">همه ←</Link>
          </div>
          {(recentOrders as any[]).length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">◈</div>
              <div className="db-empty-text">هنوز سفارشی ثبت نکرده‌اید</div>
              <a href="/" className="db-btn db-btn-gold" style={{ marginTop: 4 }}>مشاهده محصولات</a>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr><th>محصول</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th></tr>
                </thead>
                <tbody>
                  {(recentOrders as any[]).map(order => {
                    const st = statusMap[order.status] || { label: order.status, cls: 'gray' }
                    return (
                      <tr key={order._id.toString()}>
                        <td>
                          {order.items[0]?.title}
                          {order.items.length > 1 && <span style={{ fontSize: 10.5, color: '#505062', marginRight: 4 }}>+{order.items.length - 1}</span>}
                        </td>
                        <td style={{ fontSize: 11.5 }}>{new Date(order.createdAt).toLocaleDateString('fa-IR')}</td>
                        <td style={{ color: '#C8A96E', fontWeight: 800 }}>{order.finalAmount.toLocaleString('fa')} ت</td>
                        <td><span className={`db-badge db-badge-${st.cls}`}>{st.label}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Services */}
        <div className="db-card">
          <div className="db-card-head">
            <div className="db-card-title">سرویس‌های فعال</div>
          </div>
          <div className="db-card-body-pad">
            {activeServices.length === 0 ? (
              <>
                {/* نمونه placeholder */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>هاست example.ir</span>
                    <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 700 }}>۱۲ روز مانده</span>
                  </div>
                  <div className="db-prog-wrap"><div className="db-prog-fill red" style={{ width: '8%' }}></div></div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>دامنه mystore.ir</span>
                    <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700 }}>۴۵ روز مانده</span>
                  </div>
                  <div className="db-prog-wrap"><div className="db-prog-fill" style={{ width: '35%', background: 'linear-gradient(90deg,#B45309,#F59E0B)' }}></div></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>اشتراک Pro</span>
                    <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 700 }}>۸۵ روز مانده</span>
                  </div>
                  <div className="db-prog-wrap"><div className="db-prog-fill green" style={{ width: '72%' }}></div></div>
                </div>
              </>
            ) : (
              activeServices.map((svc: any, i: number) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{svc.items[0]?.title}</span>
                  </div>
                  <div className="db-prog-wrap"><div className="db-prog-fill green" style={{ width: '70%' }}></div></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Courses + Tickets */}
      <div className="db-2col">
        {/* Active Courses */}
        <div className="db-card">
          <div className="db-card-head">
            <div className="db-card-title">دوره‌های فعال</div>
            <Link href="/dashboard/courses" className="db-card-link">همه ←</Link>
          </div>
          <div className="db-card-body-pad">
            {activeCourses.length === 0 ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>وووکامرس پیشرفته</span>
                    <span style={{ fontSize: 11, color: '#505062' }}>۶۵٪</span>
                  </div>
                  <div className="db-prog-wrap"><div className="db-prog-fill blue" style={{ width: '65%' }}></div></div>
                  <div style={{ fontSize: 11, color: '#505062', marginTop: 4 }}>فصل ۵ از ۸ — تنظیمات پرداخت</div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>سئو وردپرس</span>
                    <span style={{ fontSize: 11, color: '#505062' }}>۲۰٪</span>
                  </div>
                  <div className="db-prog-wrap"><div className="db-prog-fill blue" style={{ width: '20%' }}></div></div>
                  <div style={{ fontSize: 11, color: '#505062', marginTop: 4 }}>فصل ۲ از ۱۰ — کلمات کلیدی</div>
                </div>
              </>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#505062', fontSize: 13 }}>
                دوره‌ای برای نمایش وجود ندارد
              </div>
            )}
          </div>
        </div>

        {/* Open Tickets */}
        <div className="db-card">
          <div className="db-card-head">
            <div className="db-card-title">تیکت‌های باز</div>
            <Link href="/dashboard/tickets" className="db-card-link">همه ←</Link>
          </div>
          {recentTickets.length === 0 ? (
            <div className="db-empty" style={{ padding: '28px 20px' }}>
              <div className="db-empty-icon" style={{ fontSize: 24 }}>✉</div>
              <div className="db-empty-text">تیکت باز ندارید</div>
              <Link href="/dashboard/tickets/new" className="db-btn db-btn-gold" style={{ marginTop: 4, fontSize: 12, padding: '7px 16px' }}>
                ثبت تیکت جدید
              </Link>
            </div>
          ) : (
            <div>
              {(recentTickets as any[]).map(ticket => {
                const st = ticketStatusMap[ticket.status] || { label: ticket.status, cls: 'gray' }
                return (
                  <div key={ticket._id.toString()} style={{
                    padding: '13px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{ticket.title}</div>
                      <div style={{ fontSize: 11, color: '#505062', display: 'flex', gap: 10 }}>
                        <span>#{ticket.ticketNumber}</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </div>
                    <span className={`db-badge db-badge-${st.cls}`}>{st.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="db-quick-grid" style={{ marginTop: 16 }}>
        <Link href="/dashboard/tickets/new" className="db-quick-card">
          <div className="db-quick-icon">✉</div>
          <div className="db-quick-label">ثبت تیکت جدید</div>
        </Link>
        <Link href="/dashboard/downloads" className="db-quick-card">
          <div className="db-quick-icon">↓</div>
          <div className="db-quick-label">دانلودهای من</div>
        </Link>
        <Link href="/dashboard/courses" className="db-quick-card">
          <div className="db-quick-icon">▶</div>
          <div className="db-quick-label">ادامه دوره‌ها</div>
        </Link>
        <Link href="/dashboard/profile" className="db-quick-card">
          <div className="db-quick-icon">◐</div>
          <div className="db-quick-label">ویرایش پروفایل</div>
        </Link>
      </div>
    </div>
  )
}
