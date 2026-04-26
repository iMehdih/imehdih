// src/app/admin/wallet/page.tsx
'use client'
import { useEffect, useState } from 'react'

export default function AdminWalletPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  function loadData() {
    setLoading(true)
    fetch('/api/admin/wallet')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  async function action(payload: Record<string, unknown>, id?: string) {
    setActionLoading(id || 'main')
    setMsg('')
    try {
      const res = await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (d.success) { setMsg(d.message || 'انجام شد'); loadData() }
      else setMsg(d.error || 'خطا')
    } catch { setMsg('خطای اتصال') }
    setActionLoading(null)
  }

  if (loading) return <div className="admin-page" style={{ textAlign: 'center', padding: '60px', color: 'var(--t3)' }}>در حال بارگذاری...</div>
  if (!data) return null

  return (
    <div className="admin-page">
      {msg && (
        <div className="admin-alert" style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, fontSize: 13, background: msg.includes('خطا') ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${msg.includes('خطا') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, color: msg.includes('خطا') ? 'var(--red)' : 'var(--green)' }}>
          {msg}
        </div>
      )}

      {/* Pay salary */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-head">
          <div className="admin-card-title">پرداخت حقوق ماهیانه</div>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--t2)' }}>
            پرداخت حقوق ثابت به همه کارمندان فعال — اتوماتیک در کیف پول واریز می‌شود
          </div>
          <button
            onClick={() => { if (confirm('آیا از پرداخت حقوق همه کارمندان مطمئن هستید؟')) action({ action: 'pay_salary' }) }}
            disabled={actionLoading === 'main'}
            className="admin-btn admin-btn-gold"
            style={{ opacity: actionLoading === 'main' ? 0.6 : 1 }}>
            {actionLoading === 'main' ? 'در حال پردازش...' : '💰 پرداخت حقوق همه'}
          </button>
        </div>
      </div>

      <div className="admin-2col">
        {/* Staff wallets */}
        <div className="admin-card">
          <div className="admin-card-head">
            <div className="admin-card-title">کیف پول کارمندان</div>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data.staff || []).map((s: any) => (
              <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--b2)', borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold3))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, flexShrink: 0 }}>
                  {s.firstName?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.firstName} {s.lastName}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>حقوق: {(s.salary / 1000000).toFixed(1)}م</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--gold)' }}>{((s.walletBalance || 0) / 1000000).toFixed(1)}م</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)' }}>موجودی</div>
                </div>
              </div>
            ))}
            {(data.staff || []).length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 12, padding: '20px 0' }}>کارمندی وجود ندارد</div>
            )}
          </div>
        </div>

        {/* Pending withdrawals */}
        <div className="admin-card">
          <div className="admin-card-head">
            <div className="admin-card-title">درخواست‌های برداشت</div>
            <span className="admin-badge admin-badge-red">{(data.pendingWithdrawals || []).length}</span>
          </div>
          <div>
            {(data.pendingWithdrawals || []).length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: 'var(--t3)', fontSize: 12 }}>
                درخواست برداشت در انتظار ندارید ✓
              </div>
            ) : (data.pendingWithdrawals || []).map((tx: any) => (
              <div key={tx._id} style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {tx.staffId?.firstName} {tx.staffId?.lastName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>{tx.description}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--gold)' }}>
                    {(tx.amount / 1000000).toFixed(1)}م
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => action({ action: 'approve_withdrawal', transactionId: tx._id }, tx._id)}
                    disabled={actionLoading === tx._id}
                    style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: 'var(--green)', color: '#000', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading === tx._id ? 0.6 : 1 }}>
                    ✓ تأیید و پرداخت
                  </button>
                  <button
                    onClick={() => action({ action: 'reject_withdrawal', transactionId: tx._id }, tx._id + '_r')}
                    disabled={actionLoading === tx._id + '_r'}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: 'var(--red)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    رد
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
