// src/app/(public)/products/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import Link from 'next/link'
import AddToCartButton from '@/components/ui/AddToCartButton'

const typeLabels: Record<string, string> = {
  theme: 'قالب وردپرس', plugin: 'افزونه وردپرس',
  course: 'دوره آموزشی', file: 'فایل دیجیتال',
  service_project: 'خدمت پروژه‌ای', service_recurring: 'سرویس مستمر',
  hosting: 'هاست', domain: 'دامنه', subscription_pro: 'اشتراک Pro',
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  await connectDB()

  const product = await Product.findOne({ slug, isActive: true }).lean()
  if (!product) notFound()

  const p = product as any
  const price = p.salePrice ?? p.price
  const isFree = p.price === 0
  const hasDiscount = p.salePrice && p.salePrice < p.price
  const discountPct = hasDiscount ? Math.round((1 - p.salePrice / p.price) * 100) : 0

  // user وارد شده؟
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  const isLoggedIn = !!token && !!(await verifyToken(token))

  return (
    <div className="container" style={{ padding: '32px 28px' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/">خانه</Link>
        <span>›</span>
        <Link href={`/${p.type === 'theme' ? 'themes' : p.type === 'plugin' ? 'plugins' : p.type === 'course' ? 'courses' : 'products'}`}>
          {typeLabels[p.type] || p.type}
        </Link>
        <span>›</span>
        <span>{p.title}</span>
      </div>

      <div className="product-detail-grid">
        {/* Left: Detail */}
        <div>
          {/* Thumbnail */}
          <div style={{
            height: 360, background: 'var(--b1)', border: '1px solid var(--bd)',
            borderRadius: 16, overflow: 'hidden', marginBottom: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {p.thumbnail
              ? <img src={p.thumbnail} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ fontSize: 64, color: 'var(--t3)', opacity: .3 }}>▣</div>
            }
          </div>

          {/* Description */}
          <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, padding: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 14 }}>توضیحات</h2>
            <div style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
              {p.description || p.shortDescription || 'توضیحاتی ثبت نشده.'}
            </div>
          </div>
        </div>

        {/* Right: Buy Box */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'var(--b1)', border: '1px solid var(--bd2)', borderRadius: 18, overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '22px 22px 18px', borderBottom: '1px solid var(--bd)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
                {typeLabels[p.type]}
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.35, marginBottom: 10 }}>{p.title}</h1>
              {p.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--t2)' }}>
                  <span style={{ color: 'var(--yellow)' }}>{'★'.repeat(Math.round(p.rating))}</span>
                  <span>{p.rating} ({p.reviewCount} نظر)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--bd)' }}>
              {isFree ? (
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--green)' }}>رایگان</div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)' }}>
                      {price.toLocaleString('fa')} ت
                    </span>
                    {hasDiscount && (
                      <span style={{ background: 'var(--red)', color: '#fff', fontSize: 11, fontWeight: 900, padding: '3px 9px', borderRadius: 100 }}>
                        {discountPct}٪ تخفیف
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <div style={{ fontSize: 13, color: 'var(--t3)', textDecoration: 'line-through' }}>
                      {p.price.toLocaleString('fa')} تومان
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Meta */}
            <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--bd)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.meta?.version && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--t3)' }}>نسخه</span>
                    <span style={{ fontWeight: 700 }}>{p.meta.version}</span>
                  </div>
                )}
                {p.supportDuration && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--t3)' }}>پشتیبانی</span>
                    <span style={{ fontWeight: 700 }}>{p.supportDuration} روز</span>
                  </div>
                )}
                {p.meta?.wpCompatibility && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--t3)' }}>سازگاری</span>
                    <span style={{ fontWeight: 700 }}>WP {p.meta.wpCompatibility}</span>
                  </div>
                )}
                {p.meta?.lessons && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--t3)' }}>تعداد جلسات</span>
                    <span style={{ fontWeight: 700 }}>{p.meta.lessons} جلسه</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isLoggedIn ? (
                <AddToCartButton productId={p._id.toString()} title={p.title} price={price} isFree={isFree} />
              ) : (
                <>
                  <Link href="/auth/login" className="site-btn site-btn-gold" style={{ justifyContent: 'center', fontSize: 15, padding: '13px' }}>
                    {isFree ? '↓ دانلود رایگان' : '🛒 افزودن به سبد'}
                  </Link>
                  <div style={{ fontSize: 11.5, color: 'var(--t3)', textAlign: 'center' }}>
                    برای خرید ابتدا وارد شوید
                  </div>
                </>
              )}

              {/* Guarantees */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {['ضمانت بازگشت وجه', 'پشتیبانی رسمی', 'آپدیت رایگان'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--t2)' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 900 }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          {p.tags?.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {p.tags.map((tag: string) => (
                <span key={tag} style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 100, background: 'var(--b1)', border: '1px solid var(--bd)', color: 'var(--t3)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
