// src/app/(public)/themes/page.tsx
// این pattern برای /plugins /courses /files /services هم همینه
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import Link from 'next/link'

// ProductCard component (همان که در homepage داریم)
function ProductCard({ product }: { product: any }) {
  const price = product.salePrice ?? product.price
  const isFree = product.price === 0
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const slug = `/products/${product.slug}`

  return (
    <div className="product-card">
      <Link href={slug} style={{ textDecoration: 'none' }}>
        <div className="product-card-thumb">
          {product.thumbnail
            ? <img src={product.thumbnail} alt={product.title} />
            : <div className="product-card-thumb-icon">▣</div>
          }
          <div className="product-card-badges">
            {product.isFeatured && <span className="filter-tab active" style={{ fontSize: 9.5, padding: '3px 8px' }}>ویژه</span>}
            {hasDiscount && (
              <span style={{ background: '#EF4444', color: '#fff', fontSize: 9.5, fontWeight: 900, padding: '3px 8px', borderRadius: 100 }}>
                {Math.round((1 - product.salePrice / product.price) * 100)}٪-
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="product-card-body">
        <div className="product-card-type">{product.category || 'قالب'}</div>
        <Link href={slug} style={{ textDecoration: 'none' }}>
          <div className="product-card-title">{product.title}</div>
        </Link>
        <div className="product-card-desc">{product.shortDescription}</div>
        <div className="product-card-meta">
          <div className="product-card-price">
            {isFree
              ? <span className="product-card-price-free">رایگان</span>
              : <>
                  <span className="product-card-price-sale">{price.toLocaleString('fa')} ت</span>
                  {hasDiscount && <span className="product-card-price-orig">{product.price.toLocaleString('fa')}</span>}
                </>
            }
          </div>
          {product.rating > 0 && (
            <div className="product-card-rating">
              <span>★</span>
              <span>{product.rating} ({product.reviewCount})</span>
            </div>
          )}
        </div>
      </div>
      <div className="product-card-footer">
        <Link href={slug} className="site-btn site-btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 12.5 }}>مشاهده</Link>
        <Link href={slug} className="site-btn site-btn-gold" style={{ flex: 1, justifyContent: 'center', fontSize: 12.5 }}>{isFree ? 'دانلود' : 'خرید'}</Link>
      </div>
    </div>
  )
}

// ──────────── THEMES PAGE ────────────
export default async function ThemesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>
}) {
  const sp = await searchParams
  const q = sp.q || ''
  const sort = sp.sort || '-rating'
  const category = sp.category || ''

  await connectDB()

  const filter: Record<string, unknown> = { isActive: true, type: 'service_project' }
  if (q) filter.title = { $regex: q, $options: 'i' }
  if (category) filter.category = category

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).limit(24).lean(),
    Product.countDocuments(filter),
  ])

  const sortOptions = [
    { val: '-rating', label: 'پرامتیازترین' },
    { val: '-downloadCount', label: 'پرفروش‌ترین' },
    { val: '-createdAt', label: 'جدیدترین' },
    { val: 'price', label: 'ارزان‌ترین' },
    { val: '-price', label: 'گران‌ترین' },
  ]

  const buildUrl = (params: Record<string, string>) => {
    const p = { ...(q && { q }), ...(sort && { sort }), ...(category && { category }), ...params }
    const str = new URLSearchParams(p).toString()
    return `/themes${str ? `?${str}` : ''}`
  }

  return (
    <div className="container" style={{ padding: '32px 28px' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/">خانه</Link>
        <span>›</span>
        <span>قالب وردپرس</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>قالب‌های وردپرس</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)' }}>{total} قالب — RTL کامل، پشتیبانی رسمی</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <form method="GET" style={{ display: 'contents' }}>
          <input
            className="filter-search"
            name="q"
            defaultValue={q}
            placeholder="جستجو در قالب‌ها..."
          />
          <select className="filter-select" name="sort" defaultValue={sort}
            onChange={e => { const f = new FormData(); f.set('sort', e.target.value); if (q) f.set('q', q); }}>
            {sortOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
          <button type="submit" className="site-btn site-btn-gold" style={{ fontSize: 13, padding: '10px 18px' }}>
            جستجو
          </button>
        </form>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" style={{ marginBottom: 24 }}>
        <Link href="/themes" className={`filter-tab ${!category ? 'active' : ''}`}>همه</Link>
        {['shop', 'business', 'portfolio', 'blog', 'news', 'education'].map(cat => (
          <Link key={cat} href={buildUrl({ category: cat })} className={`filter-tab ${category === cat ? 'active' : ''}`}>
            {cat === 'shop' ? 'فروشگاهی' : cat === 'business' ? 'شرکتی' : cat === 'portfolio' ? 'پورتفولیو' : cat === 'blog' ? 'وبلاگ' : cat === 'news' ? 'خبری' : 'آموزشی'}
          </Link>
        ))}
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t2)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>▣</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>محصولی یافت نشد</div>
          <Link href="/themes" style={{ color: 'var(--gold)' }}>پاک کردن فیلترها</Link>
        </div>
      ) : (
        <div className="products-grid">
          {(products as any[]).map(p => <ProductCard key={p._id.toString()} product={p} />)}
        </div>
      )}
    </div>
  )
}
