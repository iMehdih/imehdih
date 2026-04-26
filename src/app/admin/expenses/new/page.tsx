// src/app/admin/expenses/new/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const categories = [
  { val: 'salary', label: 'حقوق' },
  { val: 'bonus', label: 'پاداش' },
  { val: 'infrastructure', label: 'زیرساخت (لیارا، سرور، ...)' },
  { val: 'marketing', label: 'بازاریابی' },
  { val: 'tools', label: 'ابزارها (نرم‌افزار، اشتراک، ...)' },
  { val: 'tax', label: 'مالیات و عوارض' },
  { val: 'other', label: 'سایر' },
]

export default function NewExpensePage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', amount: '', category: 'infrastructure', type: 'manual', description: '', date: new Date().toISOString().split('T')[0] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.title || !form.amount) { setError('عنوان و مبلغ الزامی است'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      })
      const data = await res.json()
      if (data.success) router.push('/admin/expenses')
      else setError(data.error || 'خطا')
    } catch { setError('خطای اتصال') }
    setLoading(false)
  }

  return (
    <div className="admin-page">
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <div className="admin-card" style={{ maxWidth: 560 }}>
        <div className="admin-card-head">
          <div className="admin-card-title">ثبت هزینه جدید</div>
          <Link href="/admin/expenses" className="admin-card-link">← بازگشت</Link>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="admin-label">عنوان <span style={{ color: 'var(--red)' }}>*</span></label>
            <input className="admin-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="مثال: اشتراک لیارا فروردین" />
          </div>
          <div>
            <label className="admin-label">مبلغ (تومان) <span style={{ color: 'var(--red)' }}>*</span></label>
            <input className="admin-input" type="number" dir="ltr" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="800000" />
          </div>
          <div>
            <label className="admin-label">دسته‌بندی</label>
            <select className="admin-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {categories.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">نوع</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ val: 'manual', label: 'دستی' }, { val: 'offline', label: 'آفلاین (رسید کاغذی)' }].map(t => (
                <button key={t.val} type="button" onClick={() => setForm(f => ({ ...f, type: t.val }))}
                  style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: form.type === t.val ? 'var(--gold)' : 'var(--b2)', color: form.type === t.val ? '#000' : 'var(--t2)', border: `1px solid ${form.type === t.val ? 'var(--gold)' : 'rgba(255,255,255,0.06)'}` }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="admin-label">تاریخ</label>
            <input className="admin-input" type="date" dir="ltr" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="admin-label">توضیحات (اختیاری)</label>
            <textarea className="admin-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="توضیح بیشتر..." style={{ resize: 'vertical' }} />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="admin-btn admin-btn-gold" style={{ justifyContent: 'center', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'در حال ذخیره...' : '+ ثبت هزینه'}
          </button>
        </div>
      </div>
    </div>
  )
}
