'use client'
// src/app/admin/categories/page.tsx
import { useState, useEffect } from 'react'

const TYPE_LABELS: Record<string, string> = {
  theme: 'قالب وردپرس', plugin: 'افزونه وردپرس', course: 'دوره آموزشی',
  file: 'فایل دیجیتال', service_project: 'خدمت پروژه‌ای',
  service_recurring: 'سرویس مستمر', blog: 'وبلاگ',
}

const TYPES = Object.keys(TYPE_LABELS)

interface Category {
  _id: string
  name: string
  slug: string
  type: string
  description?: string
  order: number
  isActive: boolean
}

const EMPTY = { name: '', slug: '', description: '', type: 'theme', order: 0 }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [modal, setModal] = useState<null | 'add' | Category>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/categories${filterType ? `?type=${filterType}` : ''}`)
    const data = await res.json()
    setCategories(data.categories || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterType])

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add') }
  const openEdit = (cat: Category) => { setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', type: cat.type, order: cat.order }); setError(''); setModal(cat) }

  const set = (k: string, v: string | number) => {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'name' && modal === 'add') {
        next.slug = String(v).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9؀-ۿ-]/g, '')
      }
      return next
    })
  }

  const save = async () => {
    if (!form.name || !form.slug) { setError('نام و slug الزامی است'); return }
    setSaving(true); setError('')
    try {
      const isEdit = modal !== null && modal !== 'add'
      const url = isEdit ? `/api/admin/categories/${(modal as Category)._id}` : '/api/admin/categories'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'خطا'); return }
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('حذف شود؟')) return
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    load()
  }

  const toggle = async (cat: Category) => {
    await fetch(`/api/admin/categories/${cat._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !cat.isActive }) })
    load()
  }

  const grouped = TYPES.reduce<Record<string, Category[]>>((acc, t) => {
    const cats = categories.filter(c => c.type === t)
    if (cats.length > 0 || !filterType) acc[t] = cats
    return acc
  }, {})

  return (
    <div className="db-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>دسته‌بندی‌ها</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{categories.length} دسته‌بندی</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-input" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ fontSize: 13, padding: '8px 12px' }}>
            <option value="">همه نوع‌ها</option>
            {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
          <button className="site-btn site-btn-gold" onClick={openAdd} style={{ fontSize: 13, padding: '8px 16px' }}>+ دسته‌بندی جدید</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>در حال بارگذاری...</div>
      ) : (
        Object.entries(grouped).map(([type, cats]) => (
          <div key={type} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8, padding: '0 4px' }}>
              {TYPE_LABELS[type]}
            </div>
            {cats.length === 0 ? (
              <div style={{ fontSize: 12.5, color: 'var(--t3)', padding: '12px 16px', background: 'var(--b1)', borderRadius: 10, border: '1px solid var(--bd)' }}>
                هنوز دسته‌بندی ندارد
              </div>
            ) : (
              <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--b2)' }}>
                      <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>نام</th>
                      <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>Slug</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>ترتیب</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>وضعیت</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cats.map(cat => (
                      <tr key={cat._id} style={{ borderBottom: '1px solid var(--bd)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>{cat.name}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--t3)' }}>{cat.slug}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--t3)' }}>{cat.order}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button onClick={() => toggle(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                            {cat.isActive ? '🟢' : '⚫'}
                          </button>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button onClick={() => openEdit(cat)} className="site-btn site-btn-outline" style={{ fontSize: 12, padding: '5px 12px' }}>ویرایش</button>
                            <button onClick={() => del(cat._id)} style={{ background: 'none', border: '1px solid var(--bd)', borderRadius: 7, padding: '5px 10px', fontSize: 12, color: 'var(--red)', cursor: 'pointer' }}>حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}

      {/* Modal */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--b1)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, border: '1px solid var(--bd)' }}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 20 }}>
              {modal === 'add' ? 'دسته‌بندی جدید' : `ویرایش: ${(modal as Category).name}`}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>نام *</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="مثال: فروشگاهی" />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Slug *</label>
                <input className="form-input" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="shop" style={{ direction: 'ltr' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>نوع محصول *</label>
                <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>توضیحات</label>
                <textarea className="form-input" value={form.description} onChange={e => set('description', e.target.value)} rows={2} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>ترتیب نمایش</label>
                <input className="form-input" type="number" value={form.order} onChange={e => set('order', Number(e.target.value))} />
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
