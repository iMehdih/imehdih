'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devOtp, setDevOtp] = useState('')

  async function sendOTP() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('otp')
        if (data.dev_otp) setDevOtp(data.dev_otp)
      } else {
        setError(data.error || 'خطا در ارسال کد')
      }
    } catch {
      setError('خطای اتصال')
    }
    setLoading(false)
  }

  async function verifyOTP() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      })
      const data = await res.json()
      
      console.log('verify-otp response:', data)

      if (data.success) {
        const { role, isProfileComplete } = data.user
        console.log('role:', role, 'isProfileComplete:', isProfileComplete)

        if (!isProfileComplete) {
          window.location.href = '/dashboard/complete-profile'
        } else if (role === 'admin') {
          window.location.href = '/admin'
        } else if (role === 'staff') {
          window.location.href = '/staff'
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        setError(data.error || 'کد اشتباه است')
      }
    } catch (e) {
      console.error('verifyOTP error:', e)
      setError('خطای اتصال')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl', background: 'var(--bg)',
    }}>
      <div style={{
        width: '100%', maxWidth: 420, background: 'var(--b1)',
        border: '1px solid rgba(200,169,110,0.18)', borderRadius: 24,
        padding: 40, boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--t)', marginBottom: 6 }}>
            مهدی <span style={{ color: 'var(--gold)' }}>حاتم‌پور</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--t2)' }}>
            {step === 'mobile' ? 'شماره موبایل خود را وارد کنید' : `کد ارسال‌شده به ${mobile} را وارد کنید`}
          </div>
        </div>

        {devOtp && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--green)' }}>
            DEV MODE — کد تأیید: <strong style={{ fontSize: 18, letterSpacing: 4 }}>{devOtp}</strong>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)' }}>
            {error}
          </div>
        )}

        {step === 'mobile' ? (
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--t2)', marginBottom: 8 }}>شماره موبایل</label>
            <input
              type="tel"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="09123456789"
              onKeyDown={e => e.key === 'Enter' && sendOTP()}
              style={{
                width: '100%', background: 'var(--b2)', border: '1.5px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '12px 16px', color: 'var(--t)',
                fontFamily: 'Vazirmatn, sans-serif', fontSize: 16, outline: 'none',
                marginBottom: 20, textAlign: 'center', letterSpacing: 4,
              }}
            />
            <button
              onClick={sendOTP}
              disabled={loading || mobile.length !== 11}
              style={{
                width: '100%', background: 'var(--gold)', color: '#000', border: 'none',
                borderRadius: 12, padding: '13px', fontFamily: 'Vazirmatn, sans-serif',
                fontSize: 15, fontWeight: 800, cursor: 'pointer',
                opacity: (loading || mobile.length !== 11) ? 0.6 : 1,
              }}
            >
              {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
            </button>
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--t2)', marginBottom: 8 }}>کد ۶ رقمی</label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="• • • • • •"
              onKeyDown={e => e.key === 'Enter' && otp.length === 6 && verifyOTP()}
              style={{
                width: '100%', background: 'var(--b2)', border: '1.5px solid rgba(200,169,110,0.18)',
                borderRadius: 12, padding: '12px 16px', color: 'var(--t)',
                fontFamily: 'Vazirmatn, sans-serif', fontSize: 28, fontWeight: 900, outline: 'none',
                marginBottom: 20, textAlign: 'center', letterSpacing: 14,
              }}
            />
            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              style={{
                width: '100%', background: 'var(--gold)', color: '#000', border: 'none',
                borderRadius: 12, padding: '13px', fontFamily: 'Vazirmatn, sans-serif',
                fontSize: 15, fontWeight: 800, cursor: 'pointer',
                opacity: (loading || otp.length !== 6) ? 0.6 : 1, marginBottom: 12,
              }}
            >
              {loading ? 'در حال تأیید...' : 'ورود به حساب'}
            </button>
            <button
              onClick={() => { setStep('mobile'); setOtp(''); setDevOtp(''); setError('') }}
              style={{ width: '100%', background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', fontSize: 13, fontFamily: 'Vazirmatn, sans-serif' }}
            >
              تغییر شماره موبایل
            </button>
          </div>
        )}
      </div>
    </div>
  )
}