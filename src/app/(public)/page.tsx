// src/app/(public)/page.tsx
import Link from 'next/link'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import ProductCard from '@/components/ui/ProductCard'

export default async function HomePage() {
  await connectDB()

  const [featured, themes, courses] = await Promise.all([
    Product.find({ isActive: true, isFeatured: true }).limit(4).lean(),
    Product.find({ isActive: true, type: 'theme' }).sort('-rating').limit(3).lean(),
    Product.find({ isActive: true, type: 'course' }).sort('-downloadCount').limit(3).lean(),
  ])

  return (
    <>
      {/* HERO */}
      <section className="hero-wrap">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            مدیر آنلاین کسب‌وکار شما
          </div>
          <h1 className="hero-h1">
            قالب، افزونه، دوره<br />
            <em>و خدمات وردپرس</em>
          </h1>
          <p className="hero-desc">
            همه چیز برای رشد آنلاین کسب‌وکارت — از محصولات دیجیتال باکیفیت تا خدمات تخصصی با ضمانت رضایت.
          </p>
          <div className="hero-cta">
            <Link href="/themes" className="site-btn site-btn-gold" style={{ fontSize: 15, padding: '13px 30px' }}>
              مشاهده محصولات ←
            </Link>
            <Link href="/special-service" className="site-btn site-btn-outline" style={{ fontSize: 14, padding: '12px 24px' }}>
              سرویس ویژه
            </Link>
          </div>
          <div className="hero-checks">
            <span className="hero-check">پشتیبانی واقعی</span>
            <span className="hero-check">ضمانت بازگشت وجه</span>
            <span className="hero-check">آپدیت رایگان</span>
            <span className="hero-check">12+ سال تجربه</span>
          </div>
          <div className="stats-bar">
            <div className="stats-bar-item"><div className="stats-bar-val">۴۸+</div><div className="stats-bar-lbl">پروژه موفق</div></div>
            <div className="stats-bar-item"><div className="stats-bar-val">۱۲+</div><div className="stats-bar-lbl">سال تجربه</div></div>
            <div className="stats-bar-item"><div className="stats-bar-val">۴.۹</div><div className="stats-bar-lbl">امتیاز مشتریان</div></div>
            <div className="stats-bar-item"><div className="stats-bar-val">۱۰۰٪</div><div className="stats-bar-lbl">ضمانت رضایت</div></div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {(featured as any[]).length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="section-label">ویژه</div>
                <h2 className="section-h">محصولات <em>پرفروش</em></h2>
              </div>
              <Link href="/themes" className="site-btn site-btn-outline" style={{ fontSize: 13 }}>
                همه محصولات ←
              </Link>
            </div>
            <div className="products-grid-4">
              {(featured as any[]).map(p => <ProductCard key={p._id.toString()} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* THEMES */}
      {(themes as any[]).length > 0 && (
        <section className="section" style={{ background: 'var(--b1)', borderTop: '1px solid var(--bd)', borderBottom: '1px solid var(--bd)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="section-label">قالب وردپرس</div>
                <h2 className="section-h">قالب‌های <em>حرفه‌ای</em></h2>
                <p className="section-sub">RTL کامل، ووکامرس، Elementor — همه با پشتیبانی رسمی</p>
              </div>
              <Link href="/themes" className="site-btn site-btn-outline" style={{ fontSize: 13 }}>همه قالب‌ها ←</Link>
            </div>
            <div className="products-grid">
              {(themes as any[]).map(p => <ProductCard key={p._id.toString()} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* COURSES */}
      {(courses as any[]).length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="section-label">آموزش</div>
                <h2 className="section-h">دوره‌های <em>آموزشی</em></h2>
                <p className="section-sub">از صفر تا حرفه‌ای — با پشتیبانی مستقیم</p>
              </div>
              <Link href="/courses" className="site-btn site-btn-outline" style={{ fontSize: 13 }}>همه دوره‌ها ←</Link>
            </div>
            <div className="products-grid">
              {(courses as any[]).map(p => <ProductCard key={p._id.toString()} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section" style={{ background: 'var(--b1)', borderTop: '1px solid var(--bd)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label">سرویس ویژه</div>
          <h2 className="section-h" style={{ marginBottom: 14 }}>مدیریت کامل <em>حضور دیجیتال</em></h2>
          <p style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 1.85, maxWidth: 520, margin: '0 auto 32px' }}>
            هاست، طراحی، سئو، محتوا، پشتیبانی و توسعه — همه زیر یه سقف با یه نقطه تماس.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/special-service" className="site-btn site-btn-gold" style={{ fontSize: 15, padding: '13px 30px' }}>
              پیش‌ثبت‌نام رایگان ←
            </Link>
            <Link href="/services" className="site-btn site-btn-outline" style={{ fontSize: 14, padding: '12px 24px' }}>
              مشاهده خدمات
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
