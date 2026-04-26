// src/components/dashboard/Sidebar.tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface Props {
  user: {
    firstName: string
    lastName: string
    mobile: string
    isVIP: boolean
    customerScore: number
  }
}

const navItems = [
  { href: '/dashboard', label: 'داشبورد', icon: '⬡', exact: true },
  { href: '/dashboard/orders', label: 'سفارشات', icon: '◈' },
  { href: '/dashboard/downloads', label: 'دانلودها', icon: '↓' },
  { href: '/dashboard/courses', label: 'دوره‌ها', icon: '▶' },
  { href: '/dashboard/subscription', label: 'اشتراک Pro', icon: '✦' },
  { href: '/dashboard/hosting', label: 'هاست‌ها', icon: '◉' },
  { href: '/dashboard/domains', label: 'دامنه‌ها', icon: '◎' },
  { href: '/dashboard/tickets', label: 'تیکت‌ها', icon: '✉' },
  { href: '/dashboard/notifications', label: 'اعلان‌ها', icon: '◆' },
  { href: '/dashboard/invoices', label: 'فاکتورها', icon: '▣' },
  { href: '/dashboard/profile', label: 'پروفایل', icon: '◐' },
]

export default function DashboardSidebar({ user }: Props) {
  const pathname = usePathname()

  return (
    <aside className="db-sidebar">
      {/* Logo */}
      <div className="db-sb-logo">
        <div className="db-sb-logo-mark">م</div>
        <div className="db-sb-logo-text">
          <span>مهدی</span> حاتم‌پور
        </div>
      </div>

      {/* User */}
      <div className="db-sb-user">
        <div className="db-sb-ava">
          {user.firstName ? user.firstName[0] : user.mobile[2]}
        </div>
        <div className="db-sb-user-info">
          <div className="db-sb-name">
            {user.firstName} {user.lastName}
            {user.isVIP && <span className="db-vip-badge">VIP</span>}
          </div>
          <div className="db-sb-mobile">{user.mobile}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="db-sb-nav">
        {navItems.map(item => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`db-sb-item ${isActive ? 'active' : ''}`}
            >
              <span className="db-sb-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.href === '/dashboard/tickets' && (
                <span className="db-sb-badge" id="ticket-badge"></span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="db-sb-footer">
        <Link href="/" className="db-sb-footer-item">
          <span>◁</span> بازگشت به سایت
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="db-sb-footer-item" style={{ width: '100%', textAlign: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}>
            <span>⎋</span> خروج
          </button>
        </form>
      </div>
    </aside>
  )
}
