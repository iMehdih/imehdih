// src/app/(public)/blog/page.tsx
import Link from 'next/link'
import { connectDB } from '@/lib/db/mongoose'
import Article from '@/models/Article'

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const sp = await searchParams
  const q = sp.q || ''
  const page = Math.max(1, Number(sp.page || 1))
  const limit = 12

  await connectDB()

  const filter: Record<string, unknown> = { status: 'published' }
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }

  const [articles, total] = await Promise.all([
    Article.find(filter).sort('-publishedAt').skip((page - 1) * limit).limit(limit)
      .select('title slug excerpt thumbnail readTime viewCount publishedAt tags isFeatured')
      .lean(),
    Article.countDocuments(filter),
  ])

  const pages = Math.ceil(total / limit)

  return (
    <div className="container" style={{ padding: '32px 28px' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/">خانه</Link>
        <span>›</span>
        <span>وبلاگ</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>وبلاگ</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)' }}>{total} مقاله — آموزش، تجربه، کدنویسی</p>
        </div>
      </div>

      {/* Search */}
      <div className="filter-bar" style={{ marginBottom: 28 }}>
        <form method="GET" style={{ display: 'contents' }}>
          <input className="filter-search" name="q" defaultValue={q} placeholder="جستجو در مقالات..." />
          <button type="submit" className="site-btn site-btn-gold" style={{ fontSize: 13, padding: '10px 18px' }}>جستجو</button>
        </form>
      </div>

      {articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t2)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>مقاله‌ای یافت نشد</div>
          {q && <Link href="/blog" style={{ color: 'var(--gold)' }}>پاک کردن فیلتر</Link>}
          {!q && <p style={{ fontSize: 13, color: 'var(--t3)' }}>اولین مقالات به زودی منتشر می‌شوند.</p>}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="blog-grid">
            {(articles as any[]).map(a => (
              <Link key={a._id.toString()} href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                <article style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, overflow: 'hidden', transition: 'transform .15s, box-shadow .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shl)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
                >
                  <div style={{ height: 180, background: 'var(--b2)', overflow: 'hidden' }}>
                    {a.thumbnail
                      ? <img src={a.thumbnail} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 40, opacity: .2 }}>📝</div>
                    }
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    {a.isFeatured && <span style={{ fontSize: 9.5, fontWeight: 900, color: 'var(--gold)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px' }}>ویژه</span>}
                    <h2 style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.5, marginBottom: 8, color: 'var(--t)' }}>{a.title}</h2>
                    {a.excerpt && <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.excerpt}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: 'var(--t3)' }}>
                      {a.publishedAt && <span>{new Date(a.publishedAt).toLocaleDateString('fa-IR')}</span>}
                      <span>{a.readTime} دقیقه مطالعه</span>
                      {a.viewCount > 0 && <span>{a.viewCount.toLocaleString('fa')} بازدید</span>}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 32 }}>
              {page > 1 && <Link href={`/blog?${q ? `q=${q}&` : ''}page=${page - 1}`} className="site-btn site-btn-outline" style={{ fontSize: 13 }}>‹ قبلی</Link>}
              <span style={{ padding: '10px 16px', fontSize: 13, color: 'var(--t2)' }}>{page} / {pages}</span>
              {page < pages && <Link href={`/blog?${q ? `q=${q}&` : ''}page=${page + 1}`} className="site-btn site-btn-outline" style={{ fontSize: 13 }}>بعدی ›</Link>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
