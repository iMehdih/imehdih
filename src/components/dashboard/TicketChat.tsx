// src/components/dashboard/TicketChat.tsx
'use client'
import { useState } from 'react'

interface Message {
  _id?: string
  senderId: string
  senderRole: string
  content: string
  attachments: string[]
  createdAt: string
}

interface Props {
  ticketId: string
  messages: Message[]
  userId: string
  isClosed: boolean
}

export default function TicketChat({ ticketId, messages: initialMessages, userId, isClosed }: Props) {
  const [messages, setMessages] = useState(initialMessages)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleReply() {
    if (!reply.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply }),
      })
      const data = await res.json()

      if (data.success) {
        setMessages(prev => [...prev, {
          senderId: userId,
          senderRole: 'customer',
          content: reply,
          attachments: [],
          createdAt: new Date().toISOString(),
        }])
        setReply('')
      } else {
        setError(data.error || 'خطا در ارسال پیام')
      }
    } catch {
      setError('خطای اتصال')
    }

    setLoading(false)
  }

  return (
    <div>
      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {messages.map((msg, i) => {
          const isMe = msg.senderId === userId
          const isSystem = msg.senderRole === 'system'
          const date = msg.createdAt ? new Date(msg.createdAt).toLocaleString('fa-IR') : ''

          if (isSystem) {
            return (
              <div key={i} style={{ textAlign: 'center', fontSize: 11.5, color: '#505062', padding: '6px 0' }}>
                {msg.content}
              </div>
            )
          }

          return (
            <div key={i} style={{ display: 'flex', gap: 10, flexDirection: isMe ? 'row' : 'row' }}>
              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: isMe ? 'rgba(200,169,110,0.1)' : 'rgba(96,165,250,0.1)',
                border: `2px solid ${isMe ? 'rgba(200,169,110,0.3)' : 'rgba(96,165,250,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 900,
                color: isMe ? '#C8A96E' : '#60A5FA',
              }}>
                {isMe ? 'ش' : 'پ'}
              </div>

              <div style={{ flex: 1, maxWidth: '80%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: isMe ? '#C8A96E' : '#60A5FA' }}>
                    {isMe ? 'شما' : 'پشتیبانی'}
                  </span>
                  <span style={{ fontSize: 10.5, color: '#505062' }}>{date}</span>
                </div>

                <div style={{
                  background: isMe ? 'rgba(200,169,110,0.06)' : 'var(--b1)',
                  border: `1px solid ${isMe ? 'rgba(200,169,110,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 13.5,
                  color: '#EEEEF2',
                  lineHeight: 1.85,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reply Box */}
      {!isClosed && (
        <div className="db-card" style={{ padding: 20 }}>
          {error && <div className="db-alert db-alert-error" style={{ marginBottom: 12 }}>{error}</div>}
          <label className="db-label">پاسخ شما</label>
          <textarea
            className="db-input"
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="پاسخ یا توضیحات بیشتر را اینجا بنویسید..."
            rows={5}
            style={{ resize: 'vertical', lineHeight: 1.8, marginBottom: 12 }}
          />
          <button
            onClick={handleReply}
            disabled={loading || !reply.trim()}
            className="db-btn db-btn-gold"
            style={{ opacity: (loading || !reply.trim()) ? 0.6 : 1 }}
          >
            {loading ? 'در حال ارسال...' : 'ارسال پاسخ'}
          </button>
        </div>
      )}
    </div>
  )
}
