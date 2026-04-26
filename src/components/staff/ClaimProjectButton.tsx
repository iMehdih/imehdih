// src/components/staff/ClaimProjectButton.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClaimProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [claimed, setClaimed] = useState(false)

  async function handleClaim() {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/claim`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setClaimed(true)
        router.push(`/staff/projects/${projectId}`)
      } else {
        alert(data.error || 'خطا در دریافت پروژه')
      }
    } catch {
      alert('خطای اتصال')
    }
    setLoading(false)
  }

  if (claimed) return <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 800 }}>✓ دریافت شد</span>

  return (
    <button onClick={handleClaim} disabled={loading} className="db-btn db-btn-gold" style={{ opacity: loading ? 0.6 : 1, fontSize: 13 }}>
      {loading ? 'در حال...' : 'دریافت پروژه ←'}
    </button>
  )
}
