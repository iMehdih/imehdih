// src/components/layout/SiteHeader.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'
import NotificationBell from '@/components/ui/NotificationBell'

const navItems = [
  { href: '/themes', label: 'قالب‌ها' },
  { href: '/plugins', label: 'افزونه‌ها' },
  { href: '/courses', label: 'دوره‌ها' },
  { href: '/files', label: 'فایل‌ها' },
  { href: '/services', label: 'خدمات' },
  { href: '/blog', label: 'وبلاگ' },
]

interface Props {
  user?: { firstName?: string; role?: string } | null
  cartCount?: number
}

export default function SiteHeader({ user, cartCount = 0 }: Props) {
  const pathname = usePathname()

  return (
    <header className="site-header">
      {/* Logo */}
      <Link href="/" className="site-logo">
        <div className="site-logo-mark">م</div>
        <div className="site-logo-name">مهدی <span>حاتم‌پور</span></div>
      </Link>

      {/* Nav */}
      <nav className="site-nav">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`site-nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Actions */}
      <div className="site-header-acts">
        <ThemeSwitcher />

        {/* Cart */}
        <Link href="/cart" className="cart-badge" title="سبد خرید">
          🛒
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>

        {user ? (
          <>
            <NotificationBell href="/dashboard/notifications" />
            <Link
              href={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard'}
              className="site-btn site-btn-gold"
            >
              پنل کاربری
            </Link>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="site-btn site-btn-outline">ورود</Link>
            <Link href="/auth/login" className="site-btn site-btn-gold">ثبت‌نام</Link>
          </>
        )}
      </div>
    </header>
  )
}
