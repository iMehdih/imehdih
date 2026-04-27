// src/app/(public)/search/page.tsx
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import Article from '@/models/Article'
import Link from 'next/link'
import ProductCard from '@/components/ui/ProductCard'

const typeLabels: Record<string, string> = {
  theme: 'قالب', plugin: 'افزونه', course: 'دوره',
  file: 'فایل', service_project: 'خدمت', service_recurring: 'سرویس',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const sp = await searchParams
  const q = sp.q?.trim() || ''
  const type = sp.type || 'all'

  if (!q) {
    return (
      <div className="container" style={{ padding: '60px 28px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>جستجو</h1>
        <form method="GET" style={{ display: 'flex', gap: 8, justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
          <input className="filter-search" name="q" placeholder="دنبال چی می‌گردید؟" style={{ flex: 1 }} autoFocus />
          <button type="submit" className="site-btn site-btn-gold" style={{ padding: '10px 20px' }}>جستجو</button>
        </form>
      </div>
    )
  }

  await connectDB()

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regexFilter = { $regex: escaped, $options: 'i' }

  const [products, articles] = await Promise.all([
    type !== 'article'
      ? Product.find({
          isActive: true,
          $or: [{ title: regexFilter }, { shortDescription: regexFilter }, { tags: regexFilter }],
        }).limit(18).lean()
      : [],
    type !== 'product'
      ? Article.find({
          status: 'published',
          $or: [{ title: regexFilter }, { excerpt: regexFilter }, { tags: regexFilter }],
        }).select('title slug thumbnail excerpt readTime publishedAt').limit(6).lean()
      : [],
  ])

  const total = products.length + articles.length

  return (
    <div className="container" style={{ padding: '32px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
          نتایج جستجو برای «{q}»
        </h1>
        <p style={{ fontSize: 13, color: 'var(--t2)' }}>{total} نتیجه</p>
      </div>

      {/* Search bar */}
      <div className="filter-bar" style={{ marginBottom: 28 }}>
        <form method="GET" style={{ display: 'contents' }}>
          {type !== 'all' && <input type="hidden" name="type" value={type} />}
          <input className="filter-search" name="q" defaultValue={q} placeholder="جستجو..." />
          <button type="submit" className="site-btn site-btn-gold" style={{ fontSize: 13, padding: '10px 18px' }}>جستجو</button>
        </form>
      </div>

      {/* Type tabs */}
      <div className="filter-tabs" style={{ marginBottom: 28 }}>
        {[['all', 'همه'], ['product', 'محصولات'], ['article', 'مقالات']].map(([v, l]) => (
          <Link key={v} href={`/search?q=${encodeURIComponent(q)}&type=${v}`} className={`filter-tab ${type === v ? 'active' : ''}`}>{l}</Link>
        ))}
      </div>

      {total === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>نتیجه‌ای یافت نشد</div>
          <p style={{ fontSize: 13 }}>عبارت دیگری امتحان کنید یا فیلتر را تغییر دهید.</p>
        </div>
      ) : (
        <>
          {/* Products */}
          {(products as any[]).length > 0 && (
            <section style={{ marginBottom: 40 }}>
              {type === 'all' && <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>محصولات</h2>}
              <div className="products-grid">
                {(products as any[]).map(p => <ProductCard key={p._id.toString()} product={p} />)}
              </div>
            </section>
          )}

          {/* Articles */}
          {(articles as any[]).length > 0 && (
            <section>
              {type === 'all' && <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>مقالات</h2>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(articles as any[]).map(a => (
                  <Link key={a._id.toString()} href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                      {a.thumbnail && (
                        <img src={a.thumbnail} alt={a.title} style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 5, color: 'var(--t)' }}>{a.title}</div>
                        {a.excerpt && <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{a.excerpt}</div>}
                        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 6 }}>{a.readTime} دقیقه مطالعه</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
