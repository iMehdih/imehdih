// src/app/admin/notifications/page.tsx
'use client'
import { useEffect, useState } from 'react'

const productTypeLabels: Record<string, string> = {
  theme: 'قالب', plugin: 'افزونه', course: 'دوره', file: 'فایل',
  service_project: 'خدمت پروژه‌ای', service_recurring: 'سرویس مستمر',
  hosting: 'هاست', domain: 'دامنه', subscription_pro: 'اشتراک Pro',
}

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({
    title: '',
    content: '',
    targetRole: 'customer',
    targetProductType: '',
    sendSMS: false,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(r => r.json())
      .then(d => { if (d.success) setHistory(d.data) })
      .finally(() => setHistoryLoading(false))
  }, [])

  async function handleSend() {
    if (!form.title || !form.content) {
      setResult({ type: 'error', text: 'عنوان و متن الزامی است' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          targetProductType: form.targetProductType || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ type: 'success', text: data.data.message })
        setForm({ title: '', content: '', targetRole: 'customer', targetProductType: '', sendSMS: false })
        // reload history
        fetch('/api/admin/notifications').then(r => r.json()).then(d => { if (d.success) setHistory(d.data) })
      } else {
        setResult({ type: 'error', text: data.error || 'خطا' })
      }
    } catch {
      setResult({ type: 'error', text: 'خطای اتصال' })
    }
    setLoading(false)
  }

  return (
    <div className="admin-page">
      <div className="admin-2col">
        {/* فرم ارسال */}
        <div>
          <div className="admin-card" style={{ marginBottom: 14 }}>
            <div className="admin-card-head">
              <div className="admin-card-title">ارسال اعلان جدید</div>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {result && (
                <div style={{
                  padding: '11px 14px', borderRadius: 10, fontSize: 13,
                  background: result.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${result.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: result.type === 'success' ? 'var(--green)' : 'var(--red)',
                }}>
                  {result.text}
                </div>
              )}

              <div>
                <label className="admin-label">عنوان اعلان *</label>
                <input className="admin-input" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="مثال: آپدیت مهم سیستم" />
              </div>

              <div>
                <label className="admin-label">متن اعلان *</label>
                <textarea className="admin-input" rows={4} value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="متن کامل پیام را اینجا بنویسید..."
                  style={{ resize: 'vertical', lineHeight: 1.7 }} />
              </div>

              {/* فیلتر گیرندگان */}
              <div>
                <label className="admin-label">گیرندگان</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {[
                    { val: 'customer', label: 'همه مشتریان' },
                    { val: 'staff', label: 'همه کارمندان' },
                    { val: 'all', label: 'همه کاربران' },
                  ].map(opt => (
                    <button key={opt.val} type="button"
                      onClick={() => setForm(f => ({ ...f, targetRole: opt.val, targetProductType: '' }))}
                      style={{
                        padding: '7px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        background: form.targetRole === opt.val && !form.targetProductType ? 'var(--gold)' : 'var(--b2)',
                        color: form.targetRole === opt.val && !form.targetProductType ? '#000' : 'var(--t2)',
                        border: `1px solid ${form.targetRole === opt.val && !form.targetProductType ? 'var(--gold)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* فیلتر بر اساس نوع محصول */}
                <div>
                  <label className="admin-label" style={{ marginBottom: 6 }}>یا فقط خریداران:</label>
                  <select className="admin-input"
                    value={form.targetProductType}
                    onChange={e => setForm(f => ({ ...f, targetProductType: e.target.value, targetRole: 'customer' }))}>
                    <option value="">انتخاب نوع محصول (اختیاری)</option>
                    {Object.entries(productTypeLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  {form.targetProductType && (
                    <div style={{ fontSize: 11.5, color: 'var(--gold)', marginTop: 5 }}>
                      ✓ فقط خریداران {productTypeLabels[form.targetProductType]} اعلان می‌گیرند
                    </div>
                  )}
                </div>
              </div>

              {/* SMS */}
              <div style={{ padding: '12px 14px', background: 'var(--b2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>ارسال پیامک همراه</div>
                  <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                    پیامک «پیام جدید در پنل» به موبایل گیرندگان ارسال می‌شود
                  </div>
                </div>
                <div
                  onClick={() => setForm(f => ({ ...f, sendSMS: !f.sendSMS }))}
                  style={{
                    width: 44, height: 24, borderRadius: 100, cursor: 'pointer',
                    transition: 'background 0.2s', position: 'relative',
                    background: form.sendSMS ? 'var(--gold)' : 'var(--b3)',
                  }}>
                  <div style={{
                    position: 'absolute', top: 3, width: 18, height: 18,
                    borderRadius: '50%', background: '#fff', transition: 'right 0.2s',
                    right: form.sendSMS ? 3 : 23,
                  }} />
                </div>
              </div>

              {form.sendSMS && (
                <div style={{ padding: '10px 12px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--yellow)' }}>
                  ⚠ ارسال پیامک هزینه دارد. مطمئن شوید API کاوه‌نگار در .env.local تنظیم شده.
                </div>
              )}

              <button onClick={handleSend} disabled={loading}
                className="admin-btn admin-btn-gold"
                style={{ justifyContent: 'center', fontSize: 14, padding: '12px', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'در حال ارسال...' : '📣 ارسال اعلان'}
              </button>
            </div>
          </div>
        </div>

        {/* تاریخچه */}
        <div className="admin-card">
          <div className="admin-card-head">
            <div className="admin-card-title">تاریخچه ارسال‌ها</div>
          </div>
          {historyLoading ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>بارگذاری...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--t3)', fontSize: 12 }}>
              هنوز اعلانی ارسال نشده
            </div>
          ) : (
            <div>
              {history.map((log: any) => (
                <div key={log._id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    {log.after?.title}
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--t3)', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>{log.after?.recipientCount} گیرنده</span>
                    {log.after?.smsSent > 0 && (
                      <span style={{ color: 'var(--blue)' }}>{log.after.smsSent} پیامک</span>
                    )}
                    <span>{new Date(log.createdAt).toLocaleString('fa-IR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
