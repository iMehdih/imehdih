// src/app/staff/wallet/page.tsx
'use client'
import { useEffect, useState } from 'react'

export default function StaffWalletPage() {
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.success) setBalance(d.data.walletBalance || 0)
    })
  }, [])

  async function handleWithdraw() {
    if (!amount || !bankAccount) { setMsg({ type: 'error', text: 'مبلغ و شماره حساب الزامی است' }); return }
    if (Number(amount) < 5000000) { setMsg({ type: 'error', text: 'حداقل مبلغ برداشت ۵ میلیون تومان است' }); return }
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/staff/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), bankAccount }),
      })
      const data = await res.json()
      if (data.success) setMsg({ type: 'success', text: data.message })
      else setMsg({ type: 'error', text: data.error })
    } catch { setMsg({ type: 'error', text: 'خطای اتصال' }) }
    setLoading(false)
  }

  return (
    <div className="db-page">
      {/* Wallet Balance */}
      <div style={{ background: 'linear-gradient(135deg,rgba(200,169,110,0.15),rgba(200,169,110,0.05))', border: '1px solid rgba(200,169,110,0.25)', borderRadius: 18, padding: '28px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#505062', marginBottom: 8 }}>موجودی کیف پول</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#C8A96E', marginBottom: 4 }}>
          {(balance / 1000000).toFixed(1)} <span style={{ fontSize: 16, fontWeight: 600 }}>میلیون تومان</span>
        </div>
        <div style={{ fontSize: 12, color: '#505062' }}>
          حداقل برداشت ۵ میلیون · پرداخت ظرف ۷۲ ساعت
        </div>
      </div>

      {/* Withdrawal form */}
      <div className="db-card" style={{ maxWidth: 480 }}>
        <div className="db-card-head"><div className="db-card-title">درخواست برداشت</div></div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {msg && (
            <div className={`db-alert ${msg.type === 'success' ? 'db-alert-success' : 'db-alert-error'}`}>
              {msg.text}
            </div>
          )}
          <div>
            <label className="db-label">مبلغ برداشت (تومان) *</label>
            <input className="db-input" type="number" dir="ltr" value={amount}
              onChange={e => setAmount(e.target.value)} placeholder="5000000" />
            <div style={{ fontSize: 11, color: '#505062', marginTop: 4 }}>
              موجودی: {balance.toLocaleString('fa')} تومان
            </div>
          </div>
          <div>
            <label className="db-label">شماره شبا یا کارت *</label>
            <input className="db-input" dir="ltr" value={bankAccount}
              onChange={e => setBankAccount(e.target.value)} placeholder="IR..." />
          </div>
          <button onClick={handleWithdraw} disabled={loading || balance < 5000000}
            className="db-btn db-btn-gold"
            style={{ opacity: (loading || balance < 5000000) ? 0.6 : 1 }}>
            {loading ? 'در حال ثبت...' : 'ثبت درخواست برداشت'}
          </button>
          {balance < 5000000 && (
            <div style={{ fontSize: 12, color: '#F59E0B', textAlign: 'center' }}>
              موجودی کمتر از حداقل برداشت است
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
