// src/app/admin/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import Order from '@/models/Order'
import Ticket from '@/models/Ticket'
import Product from '@/models/Product'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  await connectDB()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalCustomers, totalOrders, openTickets,
    monthOrders, lastMonthOrders,
    recentOrders, recentTickets, staffList,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer', isActive: true }),
    Order.countDocuments({ status: { $in: ['paid','in_progress','completed'] } }),
    Ticket.countDocuments({ status: { $nin: ['closed','cancelled'] } }),
    Order.find({ createdAt: { $gte: startOfMonth }, status: { $in: ['paid','in_progress','completed'] } }).select('finalAmount createdAt').lean(),
    Order.find({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: { $in: ['paid','in_progress','completed'] } }).select('finalAmount').lean(),
    Order.find().sort('-createdAt').limit(6).populate('userId','firstName lastName mobile').lean(),
    Ticket.find({ status: { $nin: ['closed','cancelled'] } }).sort('-createdAt').limit(5).populate('userId','firstName lastName').lean(),
    User.find({ role: 'staff', isActive: true }).select('firstName lastName lastSeen walletBalance').lean(),
  ])

  const monthRevenue = (monthOrders as any[]).reduce((s, o) => s + o.finalAmount, 0)
  const lastMonthRevenue = (lastMonthOrders as any[]).reduce((s, o) => s + o.finalAmount, 0)
  const revenueGrowth = lastMonthRevenue > 0 ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0
  const monthProfit = Math.round(monthRevenue * 0.61) // تخمین سود

  // داده نمودار ۳۰ روز
  const chartData: number[] = []
  for (let i = 29; i >= 0; i--) {
    const day = new Date()
    day.setDate(day.getDate() - i)
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    const dayRevenue = (monthOrders as any[]).filter(o => {
      const d = new Date(o.createdAt)
      return d >= dayStart && d < dayEnd
    }).reduce((s, o) => s + o.finalAmount, 0)
    chartData.push(dayRevenue)
  }
  const maxChart = Math.max(...chartData, 1)

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)

  const statusMap: Record<string,{label:string;cls:string}> = {
    pending_payment: { label: 'انتظار پرداخت', cls: 'yellow' },
    paid: { label: 'پرداخت شده', cls: 'blue' },
    in_progress: { label: 'در انجام', cls: 'blue' },
    completed: { label: 'تکمیل', cls: 'green' },
    cancelled: { label: 'لغو', cls: 'red' },
    refunded: { label: 'مرجوع', cls: 'red' },
  }

  const ticketStatusMap: Record<string,{label:string;cls:string}> = {
    open: { label: 'در انتظار', cls: 'red' },
    in_review: { label: 'در بررسی', cls: 'blue' },
    in_progress: { label: 'در انجام', cls: 'blue' },
    waiting_info: { label: 'در انتظار', cls: 'yellow' },
    answered: { label: 'پاسخ داده شده', cls: 'green' },
    special_handling: { label: 'ویژه', cls: 'gold' },
  }

  return (
    <div className="admin-page">
      {/* ── STATS ── */}
      <div className="admin-stats-grid" style={{ marginBottom: 20 }}>
        <div className="admin-stat-card gold">
          <div className="admin-stat-icon-wrap gold">▲</div>
          <div className="admin-stat-label">درآمد این ماه</div>
          <div className="admin-stat-val">{(monthRevenue/1000000).toFixed(1)}م</div>
          <div className="admin-stat-trend up">
            ▲ {revenueGrowth}٪ نسبت به ماه قبل
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap">$</div>
          <div className="admin-stat-label">سود خالص</div>
          <div className="admin-stat-val">{(monthProfit/1000000).toFixed(1)}م</div>
          <div className="admin-stat-trend up">▲ ۱۷٪</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap">◈</div>
          <div className="admin-stat-label">سفارش این ماه</div>
          <div className="admin-stat-val">{monthOrders.length}</div>
          <div className="admin-stat-trend up">▲ {Math.max(0, monthOrders.length - (lastMonthOrders as any[]).length)} تا</div>
        </div>
        <div className="admin-stat-card warn">
          <div className="admin-stat-icon-wrap warn">✉</div>
          <div className="admin-stat-label">تیکت باز</div>
          <div className="admin-stat-val" style={{color:'#EF4444'}}>{openTickets}</div>
          <div className="admin-stat-trend down" style={{color:'#EF4444'}}>● نیاز به رسیدگی</div>
        </div>
      </div>

      {/* ── ROW 1: Chart + Right widgets ── */}
      <div className="admin-2col" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Revenue Chart */}
          <div className="admin-card">
            <div className="admin-card-head">
              <div className="admin-card-title">درآمد ۳۰ روز اخیر</div>
              <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
                <span style={{ color: '#C8A96E', fontWeight: 700 }}>● درآمد</span>
                <span style={{ color: '#22C55E', fontWeight: 700 }}>● سود</span>
              </div>
            </div>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
                {chartData.map((val, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                    <div style={{
                      width: '100%', borderRadius: '3px 3px 0 0',
                      height: `${Math.max(4, Math.round((val / maxChart) * 72))}px`,
                      background: i === chartData.length - 1
                        ? 'linear-gradient(180deg,#E2C98C,#C8A96E)'
                        : 'linear-gradient(180deg,#C8A96E,#A8843A)',
                      opacity: i === chartData.length - 1 ? 1 : 0.65,
                      transition: 'opacity 0.2s',
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10.5, color: '#505062' }}>
                <span>۱ فروردین</span><span>۱۰ فروردین</span><span>۲۰ فروردین</span><span>امروز</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="admin-card">
            <div className="admin-card-head">
              <div className="admin-card-title">آخرین سفارشات</div>
              <Link href="/admin/orders" className="admin-card-link">همه ←</Link>
            </div>
            {(recentOrders as any[]).length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: '#505062', fontSize: 13 }}>سفارشی وجود ندارد</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>مشتری</th><th>محصول</th><th>مبلغ</th><th>وضعیت</th></tr></thead>
                  <tbody>
                    {(recentOrders as any[]).map(o => {
                      const st = statusMap[o.status] || { label: o.status, cls: 'gray' }
                      const u = o.userId
                      return (
                        <tr key={o._id.toString()}>
                          <td style={{ fontWeight: 700 }}>{u?.firstName ? `${u.firstName} ${u.lastName?.charAt(0)}.` : u?.mobile}</td>
                          <td style={{ fontSize: 12 }}>{o.items[0]?.title}</td>
                          <td style={{ color: '#C8A96E', fontWeight: 800 }}>{(o.finalAmount/1000).toFixed(0)}ک</td>
                          <td><span className={`admin-badge admin-badge-${st.cls}`}>{st.label}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Staff Status */}
          <div className="admin-card">
            <div className="admin-card-head">
              <div className="admin-card-title">وضعیت کارمندان</div>
              <Link href="/admin/staff" className="admin-card-link">همه ←</Link>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(staffList as any[]).length === 0 ? (
                <div style={{ fontSize: 12, color: '#505062', padding: '8px 0', textAlign: 'center' }}>هنوز کارمندی اضافه نشده</div>
              ) : (staffList as any[]).map(s => {
                const isOnline = s.lastSeen && new Date(s.lastSeen) > fiveMinAgo
                return (
                  <div key={s._id.toString()} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A96E,#A8843A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>
                      {s.firstName?.[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{s.firstName} {s.lastName}</div>
                      <div style={{ fontSize: 10.5, color: '#505062' }}>{isOnline ? '● آنلاین' : `آخرین بازدید: ${s.lastSeen ? new Date(s.lastSeen).toLocaleDateString('fa-IR') : '—'}`}</div>
                    </div>
                    <span className={`admin-badge ${isOnline ? 'admin-badge-green' : 'admin-badge-gray'}`}>{isOnline ? 'آنلاین' : 'آفلاین'}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Online Customers */}
          <div className="admin-card">
            <div className="admin-card-head">
              <div className="admin-card-title">مشتریان آنلاین</div>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, color: '#505062', textAlign: 'center', padding: '8px 0' }}>
                آخرین بازدیدها در حال توسعه...
              </div>
            </div>
          </div>

          {/* Open Tickets */}
          <div className="admin-card">
            <div className="admin-card-head">
              <div className="admin-card-title">تیکت‌های باز</div>
              <Link href="/admin/tickets" className="admin-card-link">همه ←</Link>
            </div>
            {(recentTickets as any[]).length === 0 ? (
              <div style={{ padding: '20px 16px', fontSize: 12, color: '#505062', textAlign: 'center' }}>تیکت باز وجود ندارد ✓</div>
            ) : (recentTickets as any[]).map(t => {
              const st = ticketStatusMap[t.status] || { label: t.status, cls: 'gray' }
              const u = t.userId
              return (
                <div key={t._id.toString()} className="admin-ticket-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{t.title}</div>
                    <div style={{ fontSize: 10.5, color: '#505062' }}>
                      {u?.firstName ? `${u.firstName} ${u.lastName}` : '—'}
                      {' · '}{new Date(t.createdAt).toLocaleDateString('fa-IR')}
                    </div>
                  </div>
                  <span className={`admin-badge admin-badge-${st.cls}`}>{st.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── ROW 2: Financial Breakdown + Expenses + Staff Wallet ── */}
      <div className="admin-3col" style={{ marginBottom: 16 }}>
        {/* درآمد به تفکیک */}
        <div className="admin-card">
          <div className="admin-card-head"><div className="admin-card-title">درآمد به تفکیک</div></div>
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'قالب و افزونه', val: 6200000, max: 10000000 },
              { label: 'خدمات', val: 7800000, max: 10000000 },
              { label: 'زیرساخت', val: 2400000, max: 10000000 },
              { label: 'دوره و فایل', val: 2000000, max: 10000000 },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, color: '#8888A0' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#C8A96E' }}>{(item.val/1000000).toFixed(1)}م</span>
                </div>
                <div style={{ background: '#1C1C2A', borderRadius: 100, height: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${(item.val/item.max)*100}%`, height: '100%', borderRadius: 100, background: 'linear-gradient(90deg,#A8843A,#C8A96E)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* هزینه‌ها */}
        <div className="admin-card">
          <div className="admin-card-head"><div className="admin-card-title">هزینه‌ها این ماه</div></div>
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'حقوق کارمندان', val: '۴م' },
              { label: 'پاداش‌ها', val: '۱.۲م' },
              { label: 'لیارا', val: '۸۰۰ک' },
              { label: 'کاوه‌نگار', val: '۴۰۰ک' },
              { label: 'سایر', val: '۸۰۰ک' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, color: '#8888A0' }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#EF4444' }}>{item.val}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#EEEEF2' }}>جمع هزینه</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#EF4444' }}>۷.۲م</span>
            </div>
          </div>
        </div>

        {/* کیف پول کارمندان */}
        <div className="admin-card">
          <div className="admin-card-head">
            <div className="admin-card-title">کیف پول کارمندان</div>
            <Link href="/admin/wallet" className="admin-card-link">همه ←</Link>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(staffList as any[]).length === 0 ? (
              <div style={{ fontSize: 12, color: '#505062', textAlign: 'center', padding: '8px 0' }}>کارمندی وجود ندارد</div>
            ) : (staffList as any[]).map(s => (
              <div key={s._id.toString()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{s.firstName} {s.lastName}</div>
                  <div style={{ fontSize: 10.5, color: '#505062' }}>موجودی</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#C8A96E' }}>
                    {((s.walletBalance || 0)/1000000).toFixed(1)}م
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="admin-quick-grid">
        <Link href="/admin/products/new" className="admin-quick-card">
          <div className="admin-quick-icon">+</div>
          <div>محصول جدید</div>
        </Link>
        <Link href="/admin/orders" className="admin-quick-card">
          <div className="admin-quick-icon">◈</div>
          <div>مدیریت سفارشات</div>
        </Link>
        <Link href="/admin/customers" className="admin-quick-card">
          <div className="admin-quick-icon">◎</div>
          <div>مشتریان</div>
        </Link>
        <Link href="/admin/finance" className="admin-quick-card">
          <div className="admin-quick-icon">▲</div>
          <div>گزارش مالی</div>
        </Link>
        <Link href="/admin/notifications" className="admin-quick-card">
          <div className="admin-quick-icon">◆</div>
          <div>ارسال اعلان</div>
        </Link>
        <Link href="/admin/process-engine" className="admin-quick-card">
          <div className="admin-quick-icon">⚙</div>
          <div>Process Engine</div>
        </Link>
      </div>
    </div>
  )
}