'use client'
// src/app/(public)/special-service/SpecialServiceForm.tsx
import { useState } from 'react'

export default function SpecialServiceForm() {
  const [form, setForm] = useState({ name: '', mobile: '', website: '', plan: 'pro', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.mobile) return
    setStatus('loading')
    try {
      const res = await fetch('/api/special-service/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, color: 'var(--green)' }}>ثبت‌نام موفق!</div>
        <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.8 }}>
          اطلاعات شما دریافت شد. کارشناس ما ظرف ۲۴ ساعت با شما تماس خواهد گرفت.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 16, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>نام و نام خانوادگی *</label>
          <input
            className="form-input"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="مهدی حاتم‌پور"
            required
          />
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>شماره موبایل *</label>
          <input
            className="form-input"
            value={form.mobile}
            onChange={e => set('mobile', e.target.value)}
            placeholder="09XXXXXXXXX"
            type="tel"
            required
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>آدرس سایت (اختیاری)</label>
        <input
          className="form-input"
          value={form.website}
          onChange={e => set('website', e.target.value)}
          placeholder="https://example.com"
          type="url"
        />
      </div>

      <div>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>پلن مورد نظر</label>
        <select className="form-input" value={form.plan} onChange={e => set('plan', e.target.value)}>
          <option value="starter">استارتر — ۴۹۰,۰۰۰ تومان/ماه</option>
          <option value="pro">حرفه‌ای — ۹۹۰,۰۰۰ تومان/ماه</option>
          <option value="enterprise">سازمانی — توافقی</option>
        </select>
      </div>

      <div>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>توضیحات (اختیاری)</label>
        <textarea
          className="form-input"
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="کسب‌وکارتون رو کوتاه معرفی کنید..."
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>

      {status === 'error' && (
        <div style={{ fontSize: 13, color: 'var(--red)', textAlign: 'center' }}>
          خطا در ثبت. لطفاً دوباره امتحان کنید.
        </div>
      )}

      <button
        type="submit"
        className="site-btn site-btn-gold"
        style={{ justifyContent: 'center', fontSize: 15, padding: '14px', marginTop: 4 }}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'در حال ثبت...' : 'پیش‌ثبت‌نام رایگان →'}
      </button>
    </form>
  )
}
