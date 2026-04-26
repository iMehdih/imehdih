// src/components/admin/AdminHostingActions.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  hostingId: string
  currentStatus: string
}

export default function AdminHostingActions({ hostingId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [serverIp, setServerIp] = useState('')

  async function updateStatus(status: string) {
    setLoading(true)
    const body: Record<string, unknown> = { status }
    if (status === 'active' && serverIp) body.serverIp = serverIp
    try {
      const res = await fetch(`/api/admin/hosting/${hostingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) router.refresh()
      else alert(data.error)
    } catch { alert('خطای اتصال') }
    setLoading(false)
    setShowForm(false)
  }

  if (currentStatus === 'pending') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {showForm ? (
          <div style={{ display: 'flex', gap: 5 }}>
            <input
              value={serverIp}
              onChange={e => setServerIp(e.target.value)}
              placeholder="IP سرور"
              dir="ltr"
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--b2)', color: '#fff', fontFamily: 'inherit', fontSize: 11.5, width: 120 }}
            />
            <button onClick={() => updateStatus('active')} disabled={loading}
              style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--green)', color: '#000', border: 'none', cursor: 'pointer', fontSize: 11.5, fontFamily: 'inherit' }}>
              فعال
            </button>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)}
            style={{ padding: '5px 12px', borderRadius: 7, background: 'var(--green)', color: '#000', border: 'none', cursor: 'pointer', fontSize: 11.5, fontFamily: 'inherit', fontWeight: 800 }}>
            ✓ راه‌اندازی
          </button>
        )}
      </div>
    )
  }

  if (currentStatus === 'active') {
    return (
      <button onClick={() => updateStatus('suspended')} disabled={loading}
        className="admin-btn-sm" style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)' }}>
        تعلیق
      </button>
    )
  }

  if (currentStatus === 'suspended') {
    return (
      <button onClick={() => updateStatus('active')} disabled={loading} className="admin-btn-sm">
        فعال‌سازی
      </button>
    )
  }

  return null
}
