'use client'
// src/app/admin/blog/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = { draft: 'پیش‌نویس', published: 'منتشر شده', archived: 'آرشیو' }
const STATUS_COLORS: Record<string, string> = { draft: 'var(--t3)', published: 'var(--green)', archived: 'var(--red)' }

interface Article {
  _id: string
  title: string
  slug: string
  status: string
  isFeatured: boolean
  viewCount: number
  readTime: number
  publishedAt?: string
  createdAt: string
}

const EMPTY_FORM = { title: '', slug: '', excerpt: '', content: '', thumbnail: '', status: 'draft', isFeatured: false }

export default function AdminBlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState<null | 'add' | Article>(null)
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (q) params.set('q', q)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/admin/articles?${params}`)
    const data = await res.json()
    setArticles(data.articles || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [page, statusFilter])

  const search = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load() }

  const openAdd = () => { setForm(EMPTY_FORM); setError(''); setModal('add') }
  const openEdit = (a: Article) => {
    setForm({ title: a.title, slug: a.slug, excerpt: '', content: '', thumbnail: '', status: a.status, isFeatured: a.isFeatured })
    setError(''); setModal(a)
    fetch(`/api/admin/articles/${a._id}`).then(r => r.json()).then(d => {
      if (d.article) setForm(f => ({ ...f, excerpt: d.article.excerpt || '', content: d.article.content || '', thumbnail: d.article.thumbnail || '' }))
    })
  }

  const set = (k: string, v: string | boolean) => {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'title' && modal === 'add') next.slug = String(v).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9a-zA-Z؀-ۿ-]/g, '')
      return next
    })
  }

  const save = async () => {
    if (!form.title || !form.content) { setError('عنوان و محتوا الزامی است'); return }
    setSaving(true); setError('')
    try {
      const isEdit = modal && modal !== 'add'
      const url = isEdit ? `/api/admin/articles/${(modal as Article)._id}` : '/api/admin/articles'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'خطا'); return }
      setModal(null); load()
    } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('حذف شود؟')) return
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
    load()
  }

  const pages = Math.ceil(total / 20)

  return (
    <div className="db-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>مدیریت وبلاگ</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{total} مقاله</p>
        </div>
        <button className="site-btn site-btn-gold" onClick={openAdd} style={{ fontSize: 13, padding: '8px 16px' }}>+ مقاله جدید</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <form onSubmit={search} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
          <input className="form-input" value={q} onChange={e => setQ(e.target.value)} placeholder="جستجوی عنوان..." style={{ flex: 1 }} />
          <button type="submit" className="site-btn site-btn-gold" style={{ fontSize: 13, padding: '8px 14px' }}>جستجو</button>
        </form>
        <select className="form-input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} style={{ fontSize: 13, padding: '8px 12px', minWidth: 130 }}>
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>در حال بارگذاری...</div>
        ) : articles.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>مقاله‌ای یافت نشد</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--b2)' }}>
                {['عنوان', 'وضعیت', 'بازدید', 'زمان مطالعه', 'تاریخ', 'عملیات'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a._id} style={{ borderBottom: '1px solid var(--bd)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>{a.slug}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[a.status] }}>{STATUS_LABELS[a.status]}</span>
                    {a.isFeatured && <span style={{ fontSize: 10, marginRight: 6, color: 'var(--gold)', fontWeight: 900 }}>★ ویژه</span>}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--t2)' }}>{a.viewCount.toLocaleString('fa')}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--t2)' }}>{a.readTime} دقیقه</td>
                  <td style={{ padding: '12px 14px', color: 'var(--t3)', fontSize: 12.5 }}>
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('fa-IR') : new Date(a.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {a.status === 'published' && (
                        <Link href={`/blog/${a.slug}`} target="_blank" className="site-btn site-btn-outline" style={{ fontSize: 11.5, padding: '4px 10px' }}>مشاهده</Link>
                      )}
                      <button onClick={() => openEdit(a)} className="site-btn site-btn-outline" style={{ fontSize: 11.5, padding: '4px 10px' }}>ویرایش</button>
                      <button onClick={() => del(a._id)} style={{ background: 'none', border: '1px solid var(--bd)', borderRadius: 7, padding: '4px 10px', fontSize: 11.5, color: 'var(--red)', cursor: 'pointer' }}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
          {page > 1 && <button onClick={() => setPage(p => p - 1)} className="site-btn site-btn-outline" style={{ fontSize: 12 }}>‹ قبلی</button>}
          <span style={{ padding: '8px 14px', fontSize: 12.5, color: 'var(--t2)' }}>{page} / {pages}</span>
          {page < pages && <button onClick={() => setPage(p => p + 1)} className="site-btn site-btn-outline" style={{ fontSize: 12 }}>بعدی ›</button>}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
          <div style={{ background: 'var(--b1)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 640, border: '1px solid var(--bd)', margin: 'auto' }}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 20 }}>
              {modal === 'add' ? 'مقاله جدید' : `ویرایش: ${(modal as Article).title}`}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>عنوان *</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Slug *</label>
                <input className="form-input" value={form.slug} onChange={e => set('slug', e.target.value)} style={{ direction: 'ltr' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>خلاصه</label>
                <textarea className="form-input" value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>متن مقاله *</label>
                <textarea className="form-input" value={form.content} onChange={e => set('content', e.target.value)} rows={10} style={{ fontFamily: 'monospace', fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>تصویر (URL)</label>
                <input className="form-input" value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} style={{ direction: 'ltr' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>وضعیت</label>
                  <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5 }}>
                    <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
                    مقاله ویژه
                  </label>
                </div>
              </div>
            </div>

            {error && <div style={{ fontSize: 13, color: 'var(--red)', marginTop: 12 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="site-btn site-btn-gold" onClick={save} disabled={saving} style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}>
                {saving ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
              <button className="site-btn site-btn-outline" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}>
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
