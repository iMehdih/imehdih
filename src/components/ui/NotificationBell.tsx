// src/components/ui/NotificationBell.tsx
// نشانگر اعلان در topbar — تعداد خوانده‌نشده
'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function NotificationBell({ href = '/dashboard/notifications' }: { href?: string }) {
  const [count, setCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/notifications?limit=1')
      .then(r => r.json())
      .then(d => { if (d.success) setCount(d.data.unreadCount) })
      .catch(() => {})
  }, [pathname]) // هر بار route عوض شد، refresh کن

  return (
    <Link
      href={href}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 36, height: 36, borderRadius: 10,
        background: 'var(--b2)', border: '1px solid var(--bd)',
        color: 'var(--t2)', textDecoration: 'none', fontSize: 16,
        transition: 'all 0.2s',
      }}
      title="اعلان‌ها"
    >
      ◆
      {count > 0 && (
        <span style={{
          position: 'absolute', top: -4, left: -4,
          minWidth: 17, height: 17, borderRadius: 100,
          background: 'var(--red)', color: '#fff',
          fontSize: 9.5, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 4px', border: '2px solid var(--bg)',
        }}>
          {count > 99 ? '۹۹+' : count}
        </span>
      )}
    </Link>
  )
}
