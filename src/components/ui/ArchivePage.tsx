// src/components/ui/ArchivePage.tsx
import Link from 'next/link'
import ProductCard from './ProductCard'

interface ArchivePageProps {
  title: string
  subtitle: string
  basePath: string
  breadcrumbLabel: string
  products: any[]
  total: number
  q: string
  sort: string
  category: string
  categoryTabs?: { val: string; label: string }[]
}

const sortOptions = [
  { val: '-rating', label: 'پرامتیازترین' },
  { val: '-downloadCount', label: 'پرفروش‌ترین' },
  { val: '-createdAt', label: 'جدیدترین' },
  { val: 'price', label: 'ارزان‌ترین' },
  { val: '-price', label: 'گران‌ترین' },
]

export default function ArchivePage({
  title, subtitle, basePath, breadcrumbLabel,
  products, total, q, sort, category, categoryTabs = [],
}: ArchivePageProps) {
  const buildUrl = (params: Record<string, string>) => {
    const p = { ...(q && { q }), ...(sort !== '-rating' && { sort }), ...(category && { category }), ...params }
    const str = new URLSearchParams(p).toString()
    return `${basePath}${str ? `?${str}` : ''}`
  }

  return (
    <div className="container" style={{ padding: '32px 28px' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/">خانه</Link>
        <span>›</span>
        <span>{breadcrumbLabel}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{title}</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)' }}>{total} مورد — {subtitle}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <form method="GET" style={{ display: 'contents' }}>
          {category && <input type="hidden" name="category" value={category} />}
          <input
            className="filter-search"
            name="q"
            defaultValue={q}
            placeholder={`جستجو در ${breadcrumbLabel}...`}
          />
          <select className="filter-select" name="sort" defaultValue={sort}>
            {sortOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
          <button type="submit" className="site-btn site-btn-gold" style={{ fontSize: 13, padding: '10px 18px' }}>
            جستجو
          </button>
        </form>
      </div>

      {/* Category tabs */}
      {categoryTabs.length > 0 && (
        <div className="filter-tabs" style={{ marginBottom: 24 }}>
          <Link href={buildUrl({ category: '' })} className={`filter-tab ${!category ? 'active' : ''}`}>همه</Link>
          {categoryTabs.map(tab => (
            <Link key={tab.val} href={buildUrl({ category: tab.val })} className={`filter-tab ${category === tab.val ? 'active' : ''}`}>
              {tab.label}
            </Link>
          ))}
        </div>
      )}

      {/* Products grid */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t2)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>▣</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>موردی یافت نشد</div>
          <Link href={basePath} style={{ color: 'var(--gold)' }}>پاک کردن فیلترها</Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p: any) => <ProductCard key={p._id.toString()} product={p} />)}
        </div>
      )}
    </div>
  )
}
