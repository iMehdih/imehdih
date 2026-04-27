// src/app/(public)/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { connectDB } from '@/lib/db/mongoose'
import Article from '@/models/Article'

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  await connectDB()

  const article = await Article.findOneAndUpdate(
    { slug, status: 'published' },
    { $inc: { viewCount: 1 } },
    { new: true }
  ).populate('authorId', 'firstName lastName').lean()

  if (!article) notFound()

  const a = article as any

  return (
    <div className="container" style={{ padding: '32px 28px' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/">خانه</Link>
        <span>›</span>
        <Link href="/blog">وبلاگ</Link>
        <span>›</span>
        <span>{a.title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }} className="blog-detail-grid">
        {/* Article */}
        <article>
          {/* Thumbnail */}
          {a.thumbnail && (
            <div style={{ height: 360, borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
              <img src={a.thumbnail} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
            {a.isFeatured && (
              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.5px' }}>ویژه</span>
            )}
            {a.publishedAt && (
              <span style={{ fontSize: 13, color: 'var(--t3)' }}>{new Date(a.publishedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            )}
            <span style={{ fontSize: 13, color: 'var(--t3)' }}>{a.readTime} دقیقه مطالعه</span>
            {a.authorId && (
              <span style={{ fontSize: 13, color: 'var(--t2)' }}>
                نوشته: {a.authorId.firstName} {a.authorId.lastName}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.4, marginBottom: 16 }}>{a.title}</h1>

          {/* Excerpt */}
          {a.excerpt && (
            <p style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 1.85, marginBottom: 24, padding: '16px 20px', background: 'var(--b1)', borderRadius: 10, borderRight: '3px solid var(--gold)' }}>
              {a.excerpt}
            </p>
          )}

          {/* Content */}
          <div style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 2, whiteSpace: 'pre-wrap' }}>
            {a.content}
          </div>

          {/* Tags */}
          {a.tags?.length > 0 && (
            <div style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {a.tags.map((tag: string) => (
                <span key={tag} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 100, background: 'var(--b1)', border: '1px solid var(--bd)', color: 'var(--t3)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>درباره نویسنده</div>
            {a.authorId ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#000', flexShrink: 0 }}>
                  {a.authorId.firstName?.[0] || 'م'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{a.authorId.firstName} {a.authorId.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>نویسنده</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--t3)' }}>مهدی حاتم‌پور</div>
            )}
          </div>

          <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, padding: '18px 20px', marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>آمار مقاله</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--t3)' }}>بازدید</span>
                <span style={{ fontWeight: 700 }}>{a.viewCount.toLocaleString('fa')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--t3)' }}>زمان مطالعه</span>
                <span style={{ fontWeight: 700 }}>{a.readTime} دقیقه</span>
              </div>
            </div>
          </div>

          <Link href="/blog" className="site-btn site-btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 14, fontSize: 13 }}>
            ← همه مقالات
          </Link>
        </aside>
      </div>
    </div>
  )
}
