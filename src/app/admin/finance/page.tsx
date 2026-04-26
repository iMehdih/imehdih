// src/app/admin/finance/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const productTypeLabels: Record<string, string> = {
  theme: 'قالب', plugin: 'افزونه', course: 'دوره', file: 'فایل',
  service_project: 'خدمت پروژه‌ای', service_recurring: 'سرویس مستمر',
  hosting: 'هاست', domain: 'دامنه', subscription_pro: 'اشتراک Pro',
}

const categoryLabels: Record<string, string> = {
  salary: 'حقوق', bonus: 'پاداش', infrastructure: 'زیرساخت',
  marketing: 'بازاریابی', tools: 'ابزارها', tax: 'مالیات', other: 'سایر',
}

const PERIODS = [
  { val: 'month', label: 'این ماه' },
  { val: 'quarter', label: 'این فصل' },
  { val: 'year', label: 'امسال' },
]

export default function AdminFinancePage() {
  const [period, setPeriod] = useState('month')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/finance?period=${period}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data) })
      .finally(() => setLoading(false))
  }, [period])

  if (loading) return (
    <div className="admin-page">
      <div style={{ textAlign: 'center', padding: '60px', color: '#505062' }}>در حال بارگذاری...</div>
    </div>
  )

  if (!data) return null

  const { summary, revenueByProduct, expenseByCategory, dailyRevenue, recentExpenses } = data

  // max برای chart
  const maxDaily = Math.max(...(dailyRevenue || []).map((d: any) => d.revenue), 1)

  return (
    <div className="admin-page">
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {PERIODS.map(p => (
          <button key={p.val} onClick={() => setPeriod(p.val)}
            className={`admin-filter-btn ${period === p.val ? 'active' : ''}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: 20 }}>
        <div className="admin-stat-card gold">
          <div className="admin-stat-icon-wrap gold">▲</div>
          <div className="admin-stat-label">درآمد کل</div>
          <div className="admin-stat-val">{(summary.revenue / 1000000).toFixed(1)}م</div>
          <div className={`admin-stat-trend ${summary.revenueGrowth >= 0 ? 'up' : 'down'}`}>
            {summary.revenueGrowth >= 0 ? '▲' : '▼'} {Math.abs(summary.revenueGrowth)}٪ نسبت به دوره قبل
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap warn">▼</div>
          <div className="admin-stat-label">هزینه کل</div>
          <div className="admin-stat-val" style={{ color: '#EF4444' }}>{(summary.expense / 1000000).toFixed(1)}م</div>
          <div className={`admin-stat-trend ${summary.expenseGrowth <= 0 ? 'up' : 'down'}`}>
            {summary.expenseGrowth >= 0 ? '▲' : '▼'} {Math.abs(summary.expenseGrowth)}٪
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap gold">$</div>
          <div className="admin-stat-label">سود خالص</div>
          <div className="admin-stat-val" style={{ color: summary.profit >= 0 ? '#22C55E' : '#EF4444' }}>
            {(summary.profit / 1000000).toFixed(1)}م
          </div>
          <div className={`admin-stat-trend ${summary.profitGrowth >= 0 ? 'up' : 'down'}`}>
            {summary.profitGrowth >= 0 ? '▲' : '▼'} {Math.abs(summary.profitGrowth)}٪
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap">◈</div>
          <div className="admin-stat-label">تعداد سفارش</div>
          <div className="admin-stat-val">{summary.orderCount}</div>
          <div className="admin-stat-trend" style={{ color: '#505062' }}>
            میانگین {summary.orderCount > 0 ? Math.round(summary.revenue / summary.orderCount / 1000) : 0}ک تومان
          </div>
        </div>
      </div>

      <div className="admin-2col" style={{ marginBottom: 16 }}>
        {/* Revenue Chart */}
        <div>
          <div className="admin-card" style={{ marginBottom: 14 }}>
            <div className="admin-card-head">
              <div className="admin-card-title">نمودار درآمد روزانه</div>
              <span style={{ fontSize: 11, color: '#505062' }}>{(dailyRevenue || []).length} روز</span>
            </div>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 100 }}>
                {(dailyRevenue || []).map((d: any, i: number) => (
                  <div key={i} title={`${d._id}: ${(d.revenue / 1000).toFixed(0)}ک`}
                    style={{
                      flex: 1, borderRadius: '3px 3px 0 0', cursor: 'pointer',
                      height: `${Math.max(4, Math.round((d.revenue / maxDaily) * 90))}px`,
                      background: i === (dailyRevenue || []).length - 1
                        ? 'linear-gradient(180deg,#E2C98C,#C8A96E)'
                        : 'linear-gradient(180deg,#C8A96E,#A8843A)',
                      opacity: 0.75,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
                  />
                ))}
              </div>
              {(dailyRevenue || []).length === 0 && (
                <div style={{ textAlign: 'center', color: '#505062', fontSize: 12, padding: '30px 0' }}>داده‌ای وجود ندارد</div>
              )}
            </div>
          </div>

          {/* Revenue by product type */}
          <div className="admin-card">
            <div className="admin-card-head">
              <div className="admin-card-title">درآمد به تفکیک نوع محصول</div>
            </div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(revenueByProduct || []).length === 0 ? (
                <div style={{ color: '#505062', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>داده‌ای وجود ندارد</div>
              ) : (revenueByProduct || []).map((item: any) => {
                const pct = summary.revenue > 0 ? Math.round((item.revenue / summary.revenue) * 100) : 0
                return (
                  <div key={item._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12.5, color: '#8888A0' }}>
                        {productTypeLabels[item._id] || item._id}
                        <span style={{ fontSize: 10.5, marginRight: 6, color: '#505062' }}>({item.count} فروش)</span>
                      </span>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 10.5, color: '#505062' }}>{pct}٪</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#C8A96E' }}>
                          {(item.revenue / 1000000).toFixed(1)}م
                        </span>
                      </div>
                    </div>
                    <div style={{ background: '#1C1C2A', borderRadius: 100, height: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 100, background: 'linear-gradient(90deg,#A8843A,#C8A96E)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Expense by category */}
          <div className="admin-card">
            <div className="admin-card-head">
              <div className="admin-card-title">هزینه به تفکیک</div>
              <Link href="/admin/expenses" className="admin-card-link">مدیریت ←</Link>
            </div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(expenseByCategory || {}).length === 0 ? (
                <div style={{ color: '#505062', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>هزینه‌ای ثبت نشده</div>
              ) : Object.entries(expenseByCategory || {}).map(([cat, amount]: [string, any]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, color: '#8888A0' }}>{categoryLabels[cat] || cat}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#EF4444' }}>
                    {(amount / 1000000).toFixed(1)}م
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 800 }}>جمع</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#EF4444' }}>
                  {(summary.expense / 1000000).toFixed(1)}م
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="admin-card">
            <div className="admin-card-head"><div className="admin-card-title">عملیات سریع</div></div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/admin/expenses/new" className="admin-btn admin-btn-gold" style={{ justifyContent: 'center', fontSize: 13 }}>
                + ثبت هزینه جدید
              </Link>
              <Link href="/admin/wallet" className="admin-btn" style={{ justifyContent: 'center', fontSize: 13, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#8888A0', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                مدیریت کیف پول کارمندان
              </Link>
              <Link href="/admin/invoices" className="admin-btn" style={{ justifyContent: 'center', fontSize: 13, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#8888A0', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                مشاهده فاکتورها
              </Link>
            </div>
          </div>

          {/* Recent expenses */}
          <div className="admin-card">
            <div className="admin-card-head">
              <div className="admin-card-title">آخرین هزینه‌ها</div>
              <Link href="/admin/expenses" className="admin-card-link">همه ←</Link>
            </div>
            <div>
              {(recentExpenses || []).slice(0, 5).map((e: any) => (
                <div key={e._id} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>{e.title}</div>
                    <div style={{ fontSize: 10.5, color: '#505062' }}>
                      {categoryLabels[e.category]} · {new Date(e.date).toLocaleDateString('fa-IR')}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#EF4444' }}>
                    {(e.amount / 1000).toFixed(0)}ک
                  </span>
                </div>
              ))}
              {(recentExpenses || []).length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#505062', fontSize: 12 }}>هزینه‌ای ثبت نشده</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
