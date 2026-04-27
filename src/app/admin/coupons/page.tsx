'use client'
// src/app/admin/coupons/page.tsx
import { useState, useEffect } from 'react'

interface Coupon {
  _id: string
  code: string
  type: 'percent' | 'fixed'
  value: number
  usedCount: number
  maxUses?: number
  expiresAt?: string
  isActive: boolean
  applicableTo: string
}

const EMPTY = { code: '', type: 'percent', value: 0, maxUses: '', minOrderAmount: '', expiresAt: '', applicableTo: 'all', maxUsesPerUser: 1, isActive: true }

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'add' | Coupon>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/coupons')
    const data = await res.json()
    setCoupons(data.coupons || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add') }
  const openEdit = (c: Coupon) => {
    setForm({ code: c.code, type: c.type, value: c.value, maxUses: c.maxUses || '', minOrderAmount: '', expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '', applicableTo: c.applicableTo, maxUsesPerUser: 1, isActive: c.isActive })
    setError(''); setModal(c)
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.code || !form.value) { setError('کد و مقدار الزامی است'); return }
    setSaving(true); setError('')
    try {
      const isEdit = modal !== null && modal !== 'add'
      const url = isEdit ? `/api/admin/coupons/${(modal as Coupon)._id}` : '/api/admin/coupons'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'خطا'); return }
      setModal(null); load()
    } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('حذف شود؟')) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    load()
  }

  const toggle = async (c: Coupon) => {
    await fetch(`/api/admin/coupons/${c._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !c.isActive }) })
    load()
  }

  const isExpired = (c: Coupon) => c.expiresAt && new Date(c.expiresAt) < new Date()

  return (
    <div className="db-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>کوپن‌های تخفیف</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{coupons.length} کوپن</p>
        </div>
        <button className="site-btn site-btn-gold" onClick={openAdd} style={{ fontSize: 13, padding: '8px 16px' }}>+ کوپن جدید</button>
      </div>

      <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>در حال بارگذاری...</div>
        ) : coupons.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>کوپنی ثبت نشده</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--b2)' }}>
                {['کد', 'نوع', 'مقدار', 'استفاده', 'انقضا', 'وضعیت', 'عملیات'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--t3)', fontSize: 11.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--bd)', opacity: isExpired(c) ? 0.6 : 1 }}>
                  <td style={{ padding: '12px 14px' }}>
                    <code style={{ fontWeight: 900, fontSize: 14, color: 'var(--gold)', letterSpacing: '1px' }}>{c.code}</code>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>{c.type === 'percent' ? 'درصد' : 'مقدار ثابت'}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>{c.type === 'percent' ? `${c.value}٪` : `${c.value.toLocaleString('fa')} ت`}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--t2)' }}>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12.5, color: isExpired(c) ? 'var(--red)' : 'var(--t3)' }}>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('fa-IR') : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => toggle(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                      {c.isActive ? '🟢' : '⚫'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(c)} className="site-btn site-btn-outline" style={{ fontSize: 12, padding: '5px 12px' }}>ویرایش</button>
                      <button onClick={() => del(c._id)} style={{ background: 'none', border: '1px solid var(--bd)', borderRadius: 7, padding: '5px 10px', fontSize: 12, color: 'var(--red)', cursor: 'pointer' }}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--b1)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, border: '1px solid var(--bd)' }}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 20 }}>{modal === 'add' ? 'کوپن جدید' : `ویرایش: ${(modal as Coupon).code}`}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>کد کوپن *</label>
                <input className="form-input" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} style={{ direction: 'ltr', letterSpacing: '1px', fontFamily: 'monospace' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>نوع</label>
                  <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
                    <option value="percent">درصد</option>
                    <option value="fixed">مقدار ثابت</option>
                  </select>
                </div>
                <div><label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>مقدار *</label>
                  <input className="form-input" type="number" value={form.value} onChange={e => set('value', Number(e.target.value))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>حداکثر استفاده</label>
                  <input className="form-input" type="number" value={form.maxUses} onChange={e => set('maxUses', e.target.value)} placeholder="بی‌نهایت" />
                </div>
                <div><label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>تاریخ انقضا</label>
                  <input className="form-input" type="date" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} style={{ direction: 'ltr' }} />
                </div>
              </div>
              <div><label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>حداقل مبلغ سبد</label>
                <input className="form-input" type="number" value={form.minOrderAmount} onChange={e => set('minOrderAmount', e.target.value)} placeholder="بدون محدودیت" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5 }}>
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                فعال
              </label>
            </div>
            {error && <div style={{ fontSize: 13, color: 'var(--red)', marginTop: 12 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="site-btn site-btn-gold" onClick={save} disabled={saving} style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}>{saving ? 'در حال ذخیره...' : 'ذخیره'}</button>
              <button className="site-btn site-btn-outline" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}>انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
