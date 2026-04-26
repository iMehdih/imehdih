// src/app/dashboard/notifications/page.tsx
'use client'
import { useEffect, useState } from 'react'

const typeIcons: Record<string, string> = {
  order: '◈',
  ticket: '✉',
  project: '◉',
  payment: '▲',
  broadcast: '◆',
  system: '⬡',
}

const typeColors: Record<string, string> = {
  order: 'var(--gold)',
  ticket: 'var(--blue)',
  project: 'var(--green)',
  payment: 'var(--gold)',
  broadcast: 'var(--t2)',
  system: 'var(--t3)',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  async function loadNotifications() {
    const res = await fetch('/api/notifications?limit=50')
    const data = await res.json()
    if (data.success) {
      setNotifications(data.data.items)
      setUnreadCount(data.data.unreadCount)
    }
    setLoading(false)
  }

  useEffect(() => { loadNotifications() }, [])

  async function markAllRead() {
    setMarkingAll(true)
    await fetch('/api/notifications', { method: 'PUT' })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
    setMarkingAll(false)
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PUT' })
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return (
    <div className="db-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>
          {unreadCount > 0 ? (
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>{unreadCount} اعلان خوانده‌نشده</span>
          ) : (
            'همه اعلان‌ها خوانده شده ✓'
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="db-btn db-btn-outline"
            style={{ fontSize: 12, padding: '7px 14px' }}>
            {markingAll ? 'در حال...' : '✓ همه را خواندم'}
          </button>
        )}
      </div>

      <div className="db-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>
            در حال بارگذاری...
          </div>
        ) : notifications.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon">◆</div>
            <div className="db-empty-text">اعلانی وجود ندارد</div>
          </div>
        ) : (
          <div>
            {notifications.map(notif => (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && markRead(notif._id)}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  cursor: !notif.isRead ? 'pointer' : 'default',
                  background: notif.isRead ? 'transparent' : 'rgba(200,169,110,0.03)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!notif.isRead) (e.currentTarget as HTMLElement).style.background = 'rgba(200,169,110,0.06)' }}
                onMouseLeave={e => { if (!notif.isRead) (e.currentTarget as HTMLElement).style.background = 'rgba(200,169,110,0.03)' }}
              >
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: `${typeColors[notif.type] || 'var(--t3)'}15`,
                  border: `1px solid ${typeColors[notif.type] || 'var(--t3)'}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: typeColors[notif.type] || 'var(--t3)',
                }}>
                  {typeIcons[notif.type] || '◆'}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13.5, fontWeight: notif.isRead ? 600 : 800, color: notif.isRead ? 'var(--t2)' : 'var(--t)' }}>
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, display: 'inline-block' }} />
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--t3)', lineHeight: 1.6 }}>{notif.content}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>
                    {new Date(notif.createdAt).toLocaleString('fa-IR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
