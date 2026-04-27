// src/app/(public)/products/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import Review from '@/models/Review'
import Link from 'next/link'
import AddToCartButton from '@/components/ui/AddToCartButton'
import ProductGallery from '@/components/ui/ProductGallery'
import ProductTabs from '@/components/ui/ProductTabs'
import ProductReviews from '@/components/ui/ProductReviews'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  await connectDB()
  const p = await Product.findOne({ slug, isActive: true }).select('title shortDescription thumbnail seoTitle seoDescription').lean() as any
  if (!p) return {}
  return {
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.shortDescription,
    openGraph: {
      title: p.seoTitle || p.title,
      description: p.seoDescription || p.shortDescription,
      images: p.thumbnail ? [p.thumbnail] : [],
      type: 'website',
    },
  }
}

const typeLabels: Record<string, string> = {
  theme: 'قالب وردپرس', plugin: 'افزونه وردپرس',
  course: 'دوره آموزشی', file: 'فایل دیجیتال',
  service_project: 'خدمت پروژه‌ای', service_recurring: 'سرویس مستمر',
  hosting: 'هاست', domain: 'دامنه', subscription_pro: 'اشتراک Pro',
}

const typeArchive: Record<string, string> = {
  theme: '/themes', plugin: '/plugins', course: '/courses',
  file: '/files', service_project: '/services', service_recurring: '/services',
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

  const [initialReviewsData, cookieStore] = await Promise.all([
    Review.find({ productId: p._id, isApproved: true })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    cookies(),
  ])
  const initialReviewsTotal = await Review.countDocuments({ productId: p._id, isApproved: true })

  const token = cookieStore.get('hp_token')?.value
  const isLoggedIn = !!token && !!(await verifyToken(token))

  const price = p.salePrice ?? p.price
  const isFree = p.price === 0
  const hasDiscount = p.salePrice && p.salePrice < p.price
  const discountPct = hasDiscount ? Math.round((1 - p.salePrice / p.price) * 100) : 0

  const archivePath = typeArchive[p.type] || '/themes'

  // Build tab content (server-side rendered nodes passed to client component)
  const descriptionContent = (
    <div style={{ fontSize: 14.5, color: 'var(--t2)', lineHeight: 2, whiteSpace: 'pre-wrap' }}>
      {p.description || p.shortDescription || 'توضیحاتی ثبت نشده.'}
    </div>
  )

  const specsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {[
        p.meta?.version && { label: 'نسخه', value: p.meta.version },
        p.supportDuration && { label: 'مدت پشتیبانی', value: `${p.supportDuration} روز` },
        p.meta?.wpCompatibility && { label: 'سازگاری وردپرس', value: `WP ${p.meta.wpCompatibility}` },
        p.meta?.lessons && { label: 'تعداد جلسات', value: `${p.meta.lessons} جلسه` },
        p.meta?.duration && { label: 'مدت دوره', value: p.meta.duration },
        p.type && { label: 'نوع', value: typeLabels[p.type] || p.type },
        p.downloadCount > 0 && { label: 'تعداد دانلود', value: p.downloadCount.toLocaleString('fa') },
      ].filter(Boolean).map((row: any, i: number) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 0', borderBottom: '1px solid var(--bd)', fontSize: 13.5,
        }}>
          <span style={{ color: 'var(--t3)' }}>{row.label}</span>
          <span style={{ fontWeight: 700 }}>{row.value}</span>
        </div>
      ))}
      {p.tags?.length > 0 && (
        <div style={{ paddingTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {p.tags.map((tag: string) => (
            <span key={tag} style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 100, background: 'var(--b2)', border: '1px solid var(--bd)', color: 'var(--t3)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )

  const reviewsContent = (
    <ProductReviews
      productId={p._id.toString()}
      initialReviews={JSON.parse(JSON.stringify(initialReviewsData))}
      initialTotal={initialReviewsTotal}
      isLoggedIn={isLoggedIn}
      existingRating={p.rating || 0}
      existingReviewCount={p.reviewCount || 0}
    />
  )

  const faqContent = (
    <div style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 2 }}>
      {p.meta?.faq ? (
        <div style={{ whiteSpace: 'pre-wrap' }}>{p.meta.faq}</div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)' }}>
          سوالات متداول برای این محصول ثبت نشده.
        </div>
      )}
    </div>
  )

  const tabs = [
    { key: 'desc', label: 'توضیحات', content: descriptionContent },
    { key: 'specs', label: 'مشخصات', content: specsContent },
    { key: 'reviews', label: `نظرات${p.reviewCount > 0 ? ` (${p.reviewCount})` : ''}`, content: reviewsContent },
    { key: 'faq', label: 'سوالات', content: faqContent },
  ]

  return (
    <div className="container" style={{ padding: '32px 28px' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/">خانه</Link>
        <span>›</span>
        <Link href={archivePath}>{typeLabels[p.type] || p.type}</Link>
        <span>›</span>
        <span>{p.title}</span>
      </div>

      <div className="product-detail-grid">
        {/* Left: Gallery + Tabs */}
        <div>
          {/* Gallery */}
          <div style={{ marginBottom: 28 }}>
            <ProductGallery thumbnail={p.thumbnail} images={p.meta?.images || []} title={p.title} />
          </div>

          {/* Tabs */}
          <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, overflow: 'hidden' }}>
            <ProductTabs tabs={tabs} />
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

            {/* Key meta */}
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
                    <span style={{ color: 'var(--t3)' }}>جلسات</span>
                    <span style={{ fontWeight: 700 }}>{p.meta.lessons} جلسه</span>
                  </div>
                )}
                {p.downloadCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--t3)' }}>دانلود</span>
                    <span style={{ fontWeight: 700 }}>{p.downloadCount.toLocaleString('fa')} بار</span>
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
