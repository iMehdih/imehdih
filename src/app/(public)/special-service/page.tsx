// src/app/(public)/special-service/page.tsx
import Link from 'next/link'
import SpecialServiceForm from './SpecialServiceForm'

const features = [
  { icon: '🌐', title: 'هاست اختصاصی', desc: 'سرور سریع ایرانی با آپتایم ۹۹.۹٪ و پشتیبانی ۲۴ ساعته' },
  { icon: '🎨', title: 'طراحی حرفه‌ای', desc: 'سایت سفارشی با هویت بصری منحصربه‌فرد برای کسب‌وکار شما' },
  { icon: '📈', title: 'سئو تخصصی', desc: 'بهینه‌سازی موتور جستجو برای رتبه‌بندی پایدار در گوگل' },
  { icon: '✍️', title: 'تولید محتوا', desc: 'محتوای سئو-محور و متناسب با مخاطب هدف شما' },
  { icon: '🔒', title: 'امنیت و بکاپ', desc: 'فایروال، SSL، و بکاپ روزانه — بدون دردسر' },
  { icon: '🚀', title: 'توسعه مستمر', desc: 'بهبود مداوم سایت بر اساس آنالیز رفتار کاربران' },
]

const plans = [
  {
    name: 'استارتر',
    price: '۴۹۰,۰۰۰',
    period: 'ماهانه',
    features: ['هاست ۵ گیگ', 'SSL رایگان', 'پشتیبانی ۱۲ ساعته', 'تا ۳ صفحه', 'سئو پایه'],
    isFeatured: false,
  },
  {
    name: 'حرفه‌ای',
    price: '۹۹۰,۰۰۰',
    period: 'ماهانه',
    features: ['هاست ۲۰ گیگ', 'SSL رایگان', 'پشتیبانی ۲۴ ساعته', 'نامحدود صفحه', 'سئو پیشرفته', 'تولید ۴ مقاله/ماه', 'گزارش ماهانه'],
    isFeatured: true,
  },
  {
    name: 'سازمانی',
    price: 'توافقی',
    period: '',
    features: ['هاست اختصاصی', 'پشتیبانی ۲۴/۷', 'طراحی سفارشی', 'سئو جامع', 'محتوا نامحدود', 'امنیت پیشرفته', 'مدیر پروژه اختصاصی'],
    isFeatured: false,
  },
]

export default function SpecialServicePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-wrap" style={{ minHeight: 'auto', padding: '80px 0 60px' }}>
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            سرویس مدیریت دیجیتال
          </div>
          <h1 className="hero-h1" style={{ fontSize: 'clamp(28px, 5vw, 48px)', marginBottom: 16 }}>
            همه چیز برای رشد آنلاین<br />
            <em>زیر یه سقف</em>
          </h1>
          <p className="hero-desc" style={{ maxWidth: 560, margin: '0 auto 32px' }}>
            هاست، طراحی، سئو، محتوا، پشتیبانی، توسعه — با یک نقطه تماس و یک فاکتور ماهانه.
            نه دردسر کوردینیشن، نه سردرگمی.
          </p>
          <div className="hero-checks" style={{ justifyContent: 'center' }}>
            <span className="hero-check">ضمانت بازگشت وجه ۳۰ روزه</span>
            <span className="hero-check">بدون قرارداد بلندمدت</span>
            <span className="hero-check">شروع در ۴۸ ساعت</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-label">خدمات</div>
            <h2 className="section-h">همه چیزی که نیاز دارید</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="features-grid">
            {features.map(f => (
              <div key={f.title} style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, padding: '22px 20px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.75 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="section" style={{ background: 'var(--b1)', borderTop: '1px solid var(--bd)', borderBottom: '1px solid var(--bd)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-label">پلن‌ها</div>
            <h2 className="section-h">انتخاب پلن مناسب</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="plans-grid">
            {plans.map(plan => (
              <div key={plan.name} style={{
                background: plan.isFeatured ? 'var(--gold)' : 'var(--bg)',
                border: `2px solid ${plan.isFeatured ? 'var(--gold)' : 'var(--bd)'}`,
                borderRadius: 18, padding: '28px 24px', position: 'relative',
              }}>
                {plan.isFeatured && (
                  <div style={{ position: 'absolute', top: -12, right: 24, background: 'var(--red)', color: '#fff', fontSize: 11, fontWeight: 900, padding: '4px 12px', borderRadius: 100 }}>
                    پرفروش‌ترین
                  </div>
                )}
                <div style={{ fontSize: plan.isFeatured ? 13 : 13, fontWeight: 800, marginBottom: 8, color: plan.isFeatured ? '#000' : 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: plan.isFeatured ? '#000' : 'var(--t)' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 13, color: plan.isFeatured ? 'rgba(0,0,0,.6)' : 'var(--t3)' }}>تومان / {plan.period}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: plan.isFeatured ? '#000' : 'var(--t2)' }}>
                      <span style={{ color: plan.isFeatured ? '#000' : 'var(--green)', fontWeight: 900 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <a href="#register" className="site-btn" style={{
                  display: 'flex', justifyContent: 'center', fontSize: 14, padding: '12px',
                  background: plan.isFeatured ? '#000' : 'var(--gold)', color: plan.isFeatured ? '#fff' : '#000',
                  borderRadius: 10, textDecoration: 'none', fontWeight: 800,
                }}>
                  پیش‌ثبت‌نام رایگان
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRATION FORM */}
      <section className="section" id="register">
        <div className="container" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="section-label">پیش‌ثبت‌نام</div>
            <h2 className="section-h">شروع رایگان — بدون تعهد</h2>
            <p style={{ fontSize: 14, color: 'var(--t2)', marginTop: 8 }}>
              اطلاعاتتون رو ثبت کنید، ظرف ۲۴ ساعت کارشناس ما تماس می‌گیره.
            </p>
          </div>
          <SpecialServiceForm />
        </div>
      </section>
    </>
  )
}
