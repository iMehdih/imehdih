'use client'
// src/components/layout/PanelSidebar.tsx
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export interface NavItem {
  href: string
  label: string
  icon: string
  exact?: boolean
  badge?: string
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

interface PanelSidebarProps {
  role: 'admin' | 'dashboard' | 'staff'
  sections: NavSection[]
  user: {
    displayName: string
    sub?: string
    avatarChar: string
    avatarStyle?: React.CSSProperties
    badge?: string
  }
  homeHref?: string
  showBackToSite?: boolean
}

const roleAccent: Record<string, string> = {
  admin: 'var(--gold)',
  dashboard: 'var(--gold)',
  staff: 'var(--blue)',
}

export default function PanelSidebar({ role, sections, user, homeHref = '/', showBackToSite }: PanelSidebarProps) {
  const pathname = usePathname()
  const accent = roleAccent[role]

  return (
    <aside className="db-sidebar" data-role={role}>
      {/* Logo */}
      <div className="db-sb-logo">
        <div className="db-sb-logo-mark" style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 60%, #000))` }}>م</div>
        <div className="db-sb-logo-text">
          <span>مهدی</span> حاتم‌پور
          {role === 'admin' && <div className="db-sb-role-badge" style={{ color: accent }}>ادمین</div>}
        </div>
      </div>

      {/* User */}
      <div className="db-sb-user">
        <div className="db-sb-ava" style={user.avatarStyle}>
          {user.avatarChar}
        </div>
        <div className="db-sb-user-info">
          <div className="db-sb-name">
            {user.displayName}
            {user.badge && (
              <span className="db-vip-badge" style={{ background: accent }}>{user.badge}</span>
            )}
          </div>
          {user.sub && (
            <div className="db-sb-mobile" style={role === 'staff' ? { color: accent } : undefined}>
              {user.sub}
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="db-sb-nav">
        {sections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <div className="db-sb-section">{section.label}</div>
            )}
            {section.items.map(item => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href} className={`db-sb-item ${isActive ? 'active' : ''}`}
                  style={isActive ? { color: accent, borderRightColor: accent } : undefined}>
                  <span className="db-sb-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="db-sb-badge">{item.badge}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="db-sb-footer">
        {showBackToSite && (
          <Link href={homeHref} className="db-sb-footer-item">
            <span>◁</span> بازگشت به سایت
          </Link>
        )}
        {role === 'admin' && (
          <Link href="/dashboard" className="db-sb-footer-item">
            <span>◁</span> پنل مشتری
          </Link>
        )}
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="db-sb-footer-item" style={{ width: '100%', textAlign: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}>
            <span>⎋</span> خروج
          </button>
        </form>
      </div>
    </aside>
  )
}
