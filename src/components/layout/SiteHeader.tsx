// src/components/layout/SiteHeader.tsx
'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
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
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function openSearch() {
    setSearchOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQ.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
      setSearchOpen(false)
      setSearchQ('')
    }
  }

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

      {/* Search */}
      {searchOpen ? (
        <form onSubmit={handleSearchSubmit} className="site-search-form">
          <input
            ref={inputRef}
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="جستجو..."
            className="site-search-input"
            onBlur={() => { if (!searchQ) setSearchOpen(false) }}
            onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQ('') } }}
          />
          <button type="submit" className="site-search-btn" aria-label="جستجو">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </form>
      ) : (
        <button onClick={openSearch} className="site-search-icon-btn" aria-label="باز کردن جستجو">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      )}

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
