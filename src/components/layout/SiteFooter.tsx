// src/components/layout/SiteFooter.tsx
import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <div className="site-logo-mark">م</div>
              مهدی <span style={{ color: 'var(--gold)' }}>حاتم‌پور</span>
            </div>
            <p className="footer-desc">
              مدیر آنلاین کسب‌وکار شما — از قالب و افزونه وردپرس تا مدیریت کامل حضور دیجیتال با ضمانت رضایت.
            </p>
            <div className="footer-soc">
              <a href="#" className="footer-soc-item">📸</a>
              <a href="#" className="footer-soc-item">✈</a>
              <a href="#" className="footer-soc-item">▶</a>
              <a href="#" className="footer-soc-item">💼</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">محصولات</div>
            <Link href="/themes" className="footer-link">قالب وردپرس</Link>
            <Link href="/plugins" className="footer-link">افزونه وردپرس</Link>
            <Link href="/courses" className="footer-link">دوره‌های آموزشی</Link>
            <Link href="/files" className="footer-link">فایل‌های دیجیتال</Link>
          </div>
          <div>
            <div className="footer-col-title">خدمات</div>
            <Link href="/services" className="footer-link">بهینه‌سازی سرعت</Link>
            <Link href="/services" className="footer-link">طراحی سایت</Link>
            <Link href="/services" className="footer-link">سئو و مارکتینگ</Link>
            <Link href="/special-service" className="footer-link">سرویس ویژه</Link>
          </div>
          <div>
            <div className="footer-col-title">پشتیبانی</div>
            <Link href="/dashboard" className="footer-link">پنل کاربری</Link>
            <Link href="/dashboard/tickets/new" className="footer-link">تماس با پشتیبانی</Link>
            <Link href="/blog" className="footer-link">وبلاگ</Link>
            <Link href="/about" className="footer-link">درباره ما</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© {new Date().getFullYear()} مهدی حاتم‌پور — تمامی حقوق محفوظ است</div>
          <div className="footer-badges">
            <span className="footer-badge">زرین‌پال</span>
            <span className="footer-badge">آروان‌کلاد</span>
            <span className="footer-badge">لیارا</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
