// src/components/dashboard/ProfileForm.tsx
'use client'
import { useState } from 'react'

interface Props {
  user: {
    firstName: string
    lastName: string
    email: string
    mobile: string
    isLegal: boolean
    companyName: string
    nationalId: string
    economicCode: string
    emailNotifications: Record<string, boolean>
  }
}

export default function ProfileForm({ user }: Props) {
  const [form, setForm] = useState(user)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave() {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setMsg({ type: 'success', text: 'پروفایل با موفقیت به‌روز شد' })
      } else {
        setMsg({ type: 'error', text: data.error || 'خطا در ذخیره' })
      }
    } catch {
      setMsg({ type: 'error', text: 'خطای اتصال' })
    }
    setLoading(false)
  }

  const notifLabels: Record<string, string> = {
    orderConfirm: 'تأیید سفارش',
    ticketReply: 'پاسخ تیکت',
    hostingRenewal: 'تمدید هاست',
    internalMessages: 'پیام‌های داخلی',
    reviewReminder: 'یادآوری دیدگاه',
    newsletter: 'خبرنامه',
  }

  return (
    <div>
      {msg && (
        <div className={`db-alert ${msg.type === 'success' ? 'db-alert-success' : 'db-alert-error'}`} style={{ marginBottom: 20 }}>
          {msg.text}
        </div>
      )}

      {/* اطلاعات اصلی */}
      <div className="db-card" style={{ marginBottom: 16 }}>
        <div className="db-card-head">
          <div className="db-card-title">اطلاعات شخصی</div>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="db-2col-equal">
            <div className="db-form-row">
              <label className="db-label">نام <span>*</span></label>
              <input className="db-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="علی" />
            </div>
            <div className="db-form-row">
              <label className="db-label">نام‌خانوادگی <span>*</span></label>
              <input className="db-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="محمدی" />
            </div>
          </div>
          <div className="db-form-row">
            <label className="db-label">ایمیل</label>
            <input className="db-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="example@email.com" />
          </div>
          <div className="db-form-row">
            <label className="db-label">شماره موبایل</label>
            <input className="db-input" value={form.mobile} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 5 }}>شماره موبایل قابل تغییر نیست</div>
          </div>
        </div>
      </div>

      {/* اطلاعات حقوقی */}
      <div className="db-card" style={{ marginBottom: 16 }}>
        <div className="db-card-head">
          <div className="db-card-title">اطلاعات حقوقی</div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>برای دریافت فاکتور رسمی</div>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="db-form-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--b2)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 10, cursor: 'pointer' }}
              onClick={() => setForm(f => ({ ...f, isLegal: !f.isLegal }))}>
              <div style={{ width: 20, height: 20, borderRadius: 5, border: '2px solid', borderColor: form.isLegal ? 'var(--gold)' : 'rgba(255,255,255,0.2)', background: form.isLegal ? 'var(--gold)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {form.isLegal && <span style={{ color: '#000', fontSize: 12, fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: 'var(--t)' }}>شخص حقوقی هستم (شرکت/کسب‌وکار)</span>
            </div>
          </div>
          {form.isLegal && (
            <>
              <div className="db-form-row">
                <label className="db-label">نام شرکت</label>
                <input className="db-input" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} />
              </div>
              <div className="db-2col-equal">
                <div className="db-form-row">
                  <label className="db-label">شناسه ملی</label>
                  <input className="db-input" value={form.nationalId} onChange={e => setForm(f => ({ ...f, nationalId: e.target.value }))} />
                </div>
                <div className="db-form-row">
                  <label className="db-label">کد اقتصادی</label>
                  <input className="db-input" value={form.economicCode} onChange={e => setForm(f => ({ ...f, economicCode: e.target.value }))} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* تنظیمات ایمیل */}
      <div className="db-card" style={{ marginBottom: 20 }}>
        <div className="db-card-head">
          <div className="db-card-title">تنظیمات ایمیل</div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>پیامک همیشه ارسال می‌شود</div>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(notifLabels).map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--t2)' }}>{label}</span>
              <div
                onClick={() => setForm(f => ({ ...f, emailNotifications: { ...f.emailNotifications, [key]: !f.emailNotifications[key] } }))}
                style={{
                  width: 44, height: 24, borderRadius: 100, cursor: 'pointer', transition: 'background 0.2s', position: 'relative',
                  background: form.emailNotifications[key] ? 'var(--gold)' : 'var(--b3)',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'right 0.2s',
                  right: form.emailNotifications[key] ? 3 : 23,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={loading} className="db-btn db-btn-gold" style={{ fontSize: 14, padding: '12px 32px' }}>
        {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </button>
    </div>
  )
}
