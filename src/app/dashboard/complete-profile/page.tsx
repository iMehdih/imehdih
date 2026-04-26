'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.firstName || !form.lastName) { setError('نام و نام‌خانوادگی الزامی است'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/users/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'خطا')
      }
    } catch {
      setError('خطای اتصال')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: '#141420', border: '1.5px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '12px 16px', color: '#EEEEF2',
    fontFamily: 'Vazirmatn, sans-serif', fontSize: 14, outline: 'none', marginBottom: 16,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06060A', fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#0D0D14', border: '1px solid rgba(200,169,110,0.18)', borderRadius: 24, padding: 40 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#EEEEF2', marginBottom: 8 }}>تکمیل پروفایل</div>
        <div style={{ fontSize: 13, color: '#8888A0', marginBottom: 28 }}>برای ادامه اطلاعات زیر را وارد کنید</div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#EF4444' }}>{error}</div>}
        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#8888A0', marginBottom: 7 }}>نام <span style={{ color: '#EF4444' }}>*</span></label>
        <input style={inputStyle} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="علی" />
        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#8888A0', marginBottom: 7 }}>نام‌خانوادگی <span style={{ color: '#EF4444' }}>*</span></label>
        <input style={inputStyle} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="محمدی" />
        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#8888A0', marginBottom: 7 }}>ایمیل (اختیاری)</label>
        <input style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="example@email.com" type="email" />
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: '#C8A96E', color: '#000', border: 'none', borderRadius: 12, padding: 13, fontFamily: 'Vazirmatn, sans-serif', fontSize: 15, fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'در حال ذخیره...' : 'ادامه'}
        </button>
      </div>
    </div>
  )
}
