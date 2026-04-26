// src/components/ui/ProductCard.tsx
import Link from 'next/link'

const typeLabels: Record<string, string> = {
  theme: 'قالب وردپرس', plugin: 'افزونه وردپرس',
  course: 'دوره آموزشی', file: 'فایل دیجیتال',
  service_project: 'خدمت پروژه‌ای', service_recurring: 'سرویس مستمر',
  hosting: 'هاست', domain: 'دامنه',
}

export default function ProductCard({ product }: { product: any }) {
  const price = product.salePrice ?? product.price
  const isFree = product.price === 0
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPct = hasDiscount ? Math.round((1 - product.salePrice / product.price) * 100) : 0
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
            {product.isFeatured && (
              <span className="filter-tab active" style={{ fontSize: 9.5, padding: '3px 8px' }}>ویژه</span>
            )}
            {hasDiscount && (
              <span style={{ background: 'var(--red)', color: '#fff', fontSize: 9.5, fontWeight: 900, padding: '3px 8px', borderRadius: 100 }}>
                {discountPct}٪-
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="product-card-body">
        <div className="product-card-type">{typeLabels[product.type] || product.type}</div>
        <Link href={slug} style={{ textDecoration: 'none' }}>
          <div className="product-card-title">{product.title}</div>
        </Link>
        <div className="product-card-desc">{product.shortDescription}</div>
        <div className="product-card-meta">
          <div className="product-card-price">
            {isFree ? (
              <span className="product-card-price-free">رایگان</span>
            ) : (
              <>
                <span className="product-card-price-sale">{price.toLocaleString('fa')} ت</span>
                {hasDiscount && <span className="product-card-price-orig">{product.price.toLocaleString('fa')}</span>}
              </>
            )}
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
        <Link href={slug} className="site-btn site-btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 12.5 }}>
          مشاهده
        </Link>
        <Link href={slug} className="site-btn site-btn-gold" style={{ flex: 1, justifyContent: 'center', fontSize: 12.5 }}>
          {isFree ? 'دانلود' : 'خرید'}
        </Link>
      </div>
    </div>
  )
}
