// src/components/staff/StaffSidebar.tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/staff', label: 'داشبورد', icon: '⬡', exact: true },
  { href: '/staff/projects/available', label: 'پروژه‌های موجود', icon: '◈' },
  { href: '/staff/projects', label: 'پروژه‌های من', icon: '◉' },
  { href: '/staff/tickets', label: 'تیکت‌ها', icon: '✉' },
  { href: '/staff/customers', label: 'مشتریان', icon: '◎' },
  { href: '/staff/blog', label: 'وبلاگ', icon: '▶' },
  { href: '/staff/leaderboard', label: 'لیدربورد', icon: '▲' },
  { href: '/staff/performance', label: 'عملکرد من', icon: '◆' },
  { href: '/staff/wallet', label: 'کیف پول', icon: '✦' },
  { href: '/staff/notifications', label: 'اعلان‌ها', icon: '◐' },
]

export default function StaffSidebar({ staffId }: { staffId: string }) {
  const pathname = usePathname()
  return (
    <aside className="db-sidebar">
      <div className="db-sb-logo">
        <div className="db-sb-logo-mark">م</div>
        <div className="db-sb-logo-text"><span>مهدی</span> حاتم‌پور</div>
      </div>
      <div className="db-sb-user">
        <div className="db-sb-ava" style={{ background: 'linear-gradient(135deg,#60A5FA,#2563EB)', color: '#fff' }}>ک</div>
        <div className="db-sb-user-info">
          <div className="db-sb-name">پنل کارمند</div>
          <div className="db-sb-mobile" style={{ color: '#60A5FA', fontSize: 10.5 }}>Staff</div>
        </div>
      </div>
      <nav className="db-sb-nav">
        {navItems.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className={`db-sb-item ${isActive ? 'active' : ''}`}>
              <span className="db-sb-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="db-sb-footer">
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="db-sb-footer-item" style={{ width: '100%', textAlign: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}>
            <span>⎋</span> خروج
          </button>
        </form>
      </div>
    </aside>
  )
}
