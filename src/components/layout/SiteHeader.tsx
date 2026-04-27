// src/components/layout/SiteHeader.tsx
'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  Phone, Clock, MapPin, Headphones, Search, ShoppingCart, Moon, Sun,
  Layers, Layout, Puzzle, Image, GraduationCap, Wrench, Server,
  Briefcase, BookOpen, X, ChevronDown, Star, Zap, Globe, ShieldCheck,
  Code2, FileText, BarChart2, Building2, Newspaper, Plus, Check,
} from 'lucide-react'
import { useTheme } from '@/components/ui/ThemeProvider'

interface Props {
  user?: { firstName?: string; role?: string } | null
  cartCount?: number
}

const popularTags = [
  'قالب فروشگاهی', 'ووکامرس', 'افزونه امنیت', 'طراحی سایت',
  'هاست وردپرس', 'سئو', 'فرم‌ساز', 'موکاپ',
]

const topLinks = [
  { label: 'درباره من', href: '/about' },
  { label: 'تماس با ما', href: '/contact' },
  { label: 'قوانین و مقررات', href: '/terms' },
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'راهنما', href: '/help' },
]

const megaMenus: Record<string, React.ReactNode> = {
  themes: (
    <div className="mega">
      <div className="mega-cols">
        <div className="mega-col">
          <div className="mega-col-title">نوع قالب</div>
          <Link href="/themes?cat=store" className="mega-link"><ShoppingCart size={14} />فروشگاهی</Link>
          <Link href="/themes?cat=corporate" className="mega-link"><Building2 size={14} />شرکتی</Link>
          <Link href="/themes?cat=news" className="mega-link"><Newspaper size={14} />خبری</Link>
          <Link href="/themes?cat=personal" className="mega-link"><Layers size={14} />شخصی</Link>
          <Link href="/themes?cat=education" className="mega-link"><GraduationCap size={14} />آموزشی</Link>
        </div>
        <div className="mega-col">
          <div className="mega-col-title">ویژگی‌ها</div>
          <Link href="/themes?feat=rtl" className="mega-link"><Check size={14} />RTL کامل</Link>
          <Link href="/themes?feat=woo" className="mega-link"><Check size={14} />ووکامرس</Link>
          <Link href="/themes?feat=elementor" className="mega-link"><Check size={14} />المنتور</Link>
          <Link href="/themes?feat=free" className="mega-link"><Check size={14} />رایگان</Link>
        </div>
        <div className="mega-sidebar">
          <div className="mega-sb-title">چرا قالب ما؟</div>
          <div className="mega-sb-item"><ShieldCheck size={13} />پشتیبانی ۶ ماهه</div>
          <div className="mega-sb-item"><Zap size={13} />آپدیت مادام‌العمر</div>
          <div className="mega-sb-item"><Star size={13} />امتیاز ۴.۹/۵</div>
          <Link href="/themes" className="mega-cta">همه قالب‌ها ←</Link>
        </div>
      </div>
    </div>
  ),
  plugins: (
    <div className="mega">
      <div className="mega-cols">
        <div className="mega-col">
          <div className="mega-col-title">دسته‌بندی</div>
          <Link href="/plugins?cat=form" className="mega-link"><FileText size={14} />فرم‌ساز</Link>
          <Link href="/plugins?cat=security" className="mega-link"><ShieldCheck size={14} />امنیت</Link>
          <Link href="/plugins?cat=seo" className="mega-link"><Search size={14} />سئو</Link>
          <Link href="/plugins?cat=report" className="mega-link"><BarChart2 size={14} />گزارش</Link>
        </div>
        <div className="mega-sidebar">
          <div className="mega-sb-title">آخرین افزونه‌ها</div>
          <div className="mega-sb-item"><Plus size={13} />افزونه امنیت Pro</div>
          <div className="mega-sb-item"><Plus size={13} />فرم‌ساز پیشرفته</div>
          <Link href="/plugins" className="mega-cta">همه افزونه‌ها ←</Link>
        </div>
      </div>
    </div>
  ),
  files: (
    <div className="mega">
      <div className="mega-cols">
        <div className="mega-col">
          <div className="mega-col-title">نوع فایل</div>
          <Link href="/files?type=psd" className="mega-link"><Image size={14} />PSD موکاپ</Link>
          <Link href="/files?type=ai" className="mega-link"><Image size={14} />AI وکتور</Link>
          <Link href="/files?type=mp4" className="mega-link"><Image size={14} />MP4 موشن</Link>
          <Link href="/files?type=pptx" className="mega-link"><Image size={14} />PPTX قالب</Link>
        </div>
        <div className="mega-sidebar">
          <div className="mega-sb-title">اشتراک ویژه</div>
          <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 10 }}>دسترسی نامحدود به همه فایل‌ها</div>
          <Link href="/files" className="mega-cta">مشاهده اشتراک ←</Link>
        </div>
      </div>
    </div>
  ),
  courses: (
    <div className="mega">
      <div className="mega-cols">
        <div className="mega-col">
          <div className="mega-col-title">دوره‌ها</div>
          <Link href="/courses?cat=woo" className="mega-link"><GraduationCap size={14} />ووکامرس پیشرفته</Link>
          <Link href="/courses?cat=wp" className="mega-link"><GraduationCap size={14} />وردپرس از صفر</Link>
          <Link href="/courses?cat=seo" className="mega-link"><GraduationCap size={14} />سئو تکنیکال</Link>
          <Link href="/courses?cat=elementor" className="mega-link"><GraduationCap size={14} />المنتور حرفه‌ای</Link>
        </div>
        <div className="mega-sidebar">
          <div className="mega-sb-title">آمار</div>
          <div className="mega-sb-item"><Star size={13} />+۵۰۰ دانشجو</div>
          <div className="mega-sb-item"><Check size={13} />پشتیبانی مستقیم</div>
          <Link href="/courses" className="mega-cta">همه دوره‌ها ←</Link>
        </div>
      </div>
    </div>
  ),
  services: (
    <div className="mega">
      <div className="mega-cols">
        <div className="mega-col">
          <div className="mega-col-title">خدمات</div>
          <Link href="/services?type=speed" className="mega-link"><Zap size={14} />بهینه‌سازی سرعت</Link>
          <Link href="/services?type=install" className="mega-link"><Wrench size={14} />نصب قالب</Link>
          <Link href="/services?type=hack" className="mega-link"><ShieldCheck size={14} />پاکسازی هک</Link>
          <Link href="/services?type=seo" className="mega-link"><Search size={14} />سئو و مارکتینگ</Link>
          <Link href="/services?type=design" className="mega-link"><Code2 size={14} />طراحی سایت</Link>
        </div>
        <div className="mega-sidebar">
          <div className="mega-sb-title">آمار خدمات</div>
          <div className="mega-sb-item"><Zap size={13} />۴۵ دقیقه میانگین پاسخ</div>
          <div className="mega-sb-item"><Check size={13} />۱۰۰٪ ضمانت رضایت</div>
          <Link href="/special-service" className="mega-cta">سرویس ویژه ←</Link>
        </div>
      </div>
    </div>
  ),
  infra: (
    <div className="mega">
      <div className="mega-cols">
        <div className="mega-col">
          <div className="mega-col-title">زیرساخت</div>
          <Link href="/hosting" className="mega-link"><Server size={14} />هاست وردپرس</Link>
          <Link href="/domains" className="mega-link"><Globe size={14} />ثبت دامنه</Link>
          <Link href="/hosting?type=vps" className="mega-link"><Server size={14} />سرور مجازی</Link>
        </div>
        <div className="mega-sidebar">
          <div className="mega-sb-title">مشخصات</div>
          <div className="mega-sb-item"><Zap size={13} />آپتایم ۹۹.۹٪</div>
          <div className="mega-sb-item"><ShieldCheck size={13} />SSL رایگان</div>
          <Link href="/hosting" className="mega-cta">مشاهده پلن‌ها ←</Link>
        </div>
      </div>
    </div>
  ),
  projects: (
    <div className="mega">
      <div className="mega-projects">
        {[
          { icon: <Globe size={18} />, title: 'فروشگاه آنلاین', desc: 'ووکامرس + طراحی اختصاصی', pct: 85 },
          { icon: <Building2 size={18} />, title: 'سایت شرکتی', desc: 'المنتور + سئو', pct: 70 },
          { icon: <GraduationCap size={18} />, title: 'پلتفرم آموزش', desc: 'LMS + پنل کاربری', pct: 60 },
          { icon: <BarChart2 size={18} />, title: 'داشبورد مدیریت', desc: 'گزارشات و تحلیل', pct: 90 },
        ].map((p, i) => (
          <div key={i} className="mega-proj-card">
            <div className="mega-proj-icon">{p.icon}</div>
            <div className="mega-proj-title">{p.title}</div>
            <div className="mega-proj-desc">{p.desc}</div>
            <div className="mega-proj-bar">
              <div className="mega-proj-fill" style={{ width: `${p.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
}

const navItems = [
  { key: 'themes', label: 'قالب‌ها', icon: <Layout size={15} />, href: '/themes', hasMega: true },
  { key: 'plugins', label: 'افزونه‌ها', icon: <Puzzle size={15} />, href: '/plugins', hasMega: true },
  { key: 'files', label: 'فایل‌ها', icon: <Image size={15} />, href: '/files', hasMega: true },
  { key: 'courses', label: 'دوره‌ها', icon: <GraduationCap size={15} />, href: '/courses', hasMega: true },
  { key: 'services', label: 'خدمات', icon: <Wrench size={15} />, href: '/services', hasMega: true },
  { key: 'infra', label: 'زیرساخت', icon: <Server size={15} />, href: '/hosting', hasMega: true },
  { key: 'projects', label: 'پروژه‌ها', icon: <Briefcase size={15} />, href: '/projects', hasMega: true },
  { key: 'blog', label: 'وبلاگ', icon: <BookOpen size={15} />, href: '/blog', hasMega: false },
]

// Static cart items for display
const cartItems = [
  { title: 'قالب فروشگاهی وستا', price: '۱۸۰,۰۰۰ ت' },
  { title: 'افزونه امنیت Pro', price: '۹۵,۰۰۰ ت' },
]

export default function SiteHeader({ user, cartCount = 0 }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [openMega, setOpenMega] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchOverlayRef = useRef<HTMLDivElement>(null)
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openSearch() {
    setSearchOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchQ('')
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQ.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
      closeSearch()
    }
  }

  function handleMegaEnter(key: string) {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current)
    setOpenMega(key)
  }

  function handleMegaLeave() {
    megaTimeoutRef.current = setTimeout(() => setOpenMega(null), 150)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { closeSearch(); setOpenMega(null) }
    }
    function onOutside(e: MouseEvent) {
      if (searchOpen && searchOverlayRef.current && !searchOverlayRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onOutside)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onOutside) }
  }, [searchOpen])

  const displayCount = cartCount || 2

  return (
    <header className="hdr" dir="rtl">
      {/* ROW 1: Topbar */}
      <div className="hdr-r1">
        <div className="container hdr-r1-inner">
          <div className="hdr-r1-left">
            <span className="hdr-r1-item"><Phone size={12} /><span>۰۹۱۳۱XXXXXX</span></span>
            <span className="hdr-r1-sep">|</span>
            <span className="hdr-r1-item"><Clock size={12} /><span>پاسخگویی: ۹ تا ۲۱</span></span>
            <span className="hdr-r1-sep">|</span>
            <span className="hdr-r1-item"><MapPin size={12} /><span>ایران — سراسر کشور</span></span>
          </div>
          <div className="hdr-r1-right">
            {topLinks.map((l, i) => (
              <span key={l.href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span className="hdr-r1-sep">|</span>}
                <Link href={l.href} className="hdr-r1-link">{l.label}</Link>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 2: Logo + Actions */}
      <div className="hdr-r2">
        <div className="container hdr-r2-inner">
          {/* Logo */}
          <Link href="/" className="hdr-logo">
            <div className="hdr-logo-mark"><Layers size={16} /></div>
            <div className="hdr-logo-text">مهدی <span>حاتم‌پور</span></div>
          </Link>

          {/* Hotline */}
          <button className="hdr-hotline">
            <Headphones size={15} />
            <span>مشاوره رایگان: ۰۲۱-XXXX</span>
          </button>

          <div className="hdr-r2-acts">
            {/* Theme Toggle */}
            <button
              className="hdr-icon-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="تغییر تم"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Search */}
            <button className="hdr-icon-btn" onClick={openSearch} title="جستجو">
              <Search size={17} />
            </button>

            {/* Cart */}
            <div className="hdr-cart-wrap" onMouseEnter={() => setCartOpen(true)} onMouseLeave={() => setCartOpen(false)}>
              <Link href="/cart" className="hdr-icon-btn hdr-cart-btn">
                <ShoppingCart size={17} />
                <span className="hdr-cart-badge">{displayCount}</span>
              </Link>
              {cartOpen && (
                <div className="hdr-cart-drop">
                  <div className="hdr-cart-items">
                    {cartItems.map((item, i) => (
                      <div key={i} className="hdr-cart-item">
                        <div className="hdr-cart-item-title">{item.title}</div>
                        <div className="hdr-cart-item-price">{item.price}</div>
                      </div>
                    ))}
                  </div>
                  <Link href="/cart" className="hdr-cart-checkout">تکمیل خرید</Link>
                </div>
              )}
            </div>

            {/* Auth buttons */}
            {user ? (
              <Link
                href={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard'}
                className="btn btn-gold btn-sm"
              >
                پنل کاربری
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost btn-sm">ورود</Link>
                <Link href="/auth/login" className="btn btn-gold btn-sm">ثبت‌نام</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="hdr-search-overlay" ref={searchOverlayRef}>
          <div className="container">
            <form onSubmit={handleSearchSubmit} className="hdr-search-form">
              <Search size={18} className="hdr-search-icon" />
              <input
                ref={inputRef}
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="جستجو در قالب‌ها، دوره‌ها، خدمات، فایل‌ها..."
                className="hdr-search-input"
              />
              <button type="button" onClick={closeSearch} className="hdr-search-close">
                <X size={18} />
              </button>
            </form>
            <div className="hdr-search-tags">
              <span className="hdr-search-tags-label">جستجوهای محبوب:</span>
              {popularTags.map(tag => (
                <button
                  key={tag}
                  className="hdr-search-tag"
                  onClick={() => { router.push(`/search?q=${encodeURIComponent(tag)}`); closeSearch() }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROW 3: Mega Nav */}
      <div className="hdr-r3">
        <div className="container hdr-r3-inner">
          <nav className="hdr-nav">
            {navItems.map(item => (
              <div
                key={item.key}
                className={`nb-item ${openMega === item.key ? 'open' : ''}`}
                onMouseEnter={() => item.hasMega ? handleMegaEnter(item.key) : undefined}
                onMouseLeave={() => item.hasMega ? handleMegaLeave() : undefined}
              >
                <Link
                  href={item.href}
                  className={`nb-link ${pathname.startsWith(item.href) ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.hasMega && <ChevronDown size={12} className="nb-chevron" />}
                </Link>
                {item.hasMega && openMega === item.key && megaMenus[item.key]}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
