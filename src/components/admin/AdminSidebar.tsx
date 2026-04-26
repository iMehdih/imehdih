// src/components/admin/AdminSidebar.tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const sections = [
  {
    label: 'اصلی',
    items: [
      { href: '/admin', label: 'داشبورد', icon: '⬡', exact: true },
    ]
  },
  {
    label: 'فروش',
    items: [
      { href: '/admin/orders', label: 'سفارشات', icon: '◈' },
      { href: '/admin/products', label: 'محصولات', icon: '▣' },
      { href: '/admin/coupons', label: 'کوپن‌ها', icon: '◆' },
    ]
  },
  {
    label: 'عملیات',
    items: [
      { href: '/admin/projects', label: 'پروژه‌ها', icon: '◉' },
      { href: '/admin/process-engine', label: 'Process Engine', icon: '⚙' },
      { href: '/admin/tickets', label: 'تیکت‌ها', icon: '✉' },
    ]
  },
  {
    label: 'کاربران',
    items: [
      { href: '/admin/customers', label: 'مشتریان', icon: '◎' },
      { href: '/admin/staff', label: 'کارمندان', icon: '◐' },
    ]
  },
  {
    label: 'مالی',
    items: [
      { href: '/admin/finance', label: 'داشبورد مالی', icon: '▲' },
      { href: '/admin/invoices', label: 'فاکتورها', icon: '▣' },
      { href: '/admin/wallet', label: 'کیف پول کارمندان', icon: '◆' },
      { href: '/admin/expenses', label: 'هزینه‌ها', icon: '▼' },
    ]
  },
  {
    label: 'زیرساخت',
    items: [
      { href: '/admin/hosting', label: 'هاست‌ها', icon: '◉' },
      { href: '/admin/domains', label: 'دامنه‌ها', icon: '◎' },
    ]
  },
  {
    label: 'سیستم',
    items: [
      { href: '/admin/notifications', label: 'اعلان‌ها', icon: '◆' },
      { href: '/admin/blog', label: 'وبلاگ', icon: '▶' },
      { href: '/admin/audit', label: 'Audit Log', icon: '▣' },
      { href: '/admin/settings', label: 'تنظیمات', icon: '⚙' },
    ]
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="admin-sidebar">
      <div className="admin-sb-logo">
        <div className="admin-sb-logo-mark">م</div>
        <div className="admin-sb-logo-text">
          <span>مهدی</span> حاتم‌پور
          <div className="admin-sb-badge">ادمین</div>
        </div>
      </div>

      <nav className="admin-sb-nav">
        {sections.map(section => (
          <div key={section.label}>
            <div className="admin-sb-section">{section.label}</div>
            {section.items.map(item => {
              const isActive = ('exact' in item && item.exact)
                ? pathname === item.href
                : pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href} className={`admin-sb-item ${isActive ? 'active' : ''}`}>
                  <span className="admin-sb-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="admin-sb-footer">
        <Link href="/dashboard" className="admin-sb-footer-item">
          <span>◁</span> پنل مشتری
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="admin-sb-footer-item" style={{ width:'100%',textAlign:'right',background:'none',border:'none',cursor:'pointer',color:'inherit',fontFamily:'inherit',fontSize:'inherit' }}>
            <span>⎋</span> خروج
          </button>
        </form>
      </div>
    </aside>
  )
}
