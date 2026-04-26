// src/components/admin/AdminTicketActions.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
  { val: 'open', label: 'در انتظار بررسی' },
  { val: 'in_review', label: 'در حال بررسی' },
  { val: 'waiting_info', label: 'در انتظار اطلاعات' },
  { val: 'in_progress', label: 'در حال انجام' },
  { val: 'answered', label: 'پاسخ داده شده' },
  { val: 'special_handling', label: 'رسیدگی ویژه' },
  { val: 'waiting_payment', label: 'در انتظار پرداخت' },
  { val: 'resolved_pending_confirm', label: 'حل شده — انتظار تأیید' },
  { val: 'closed', label: 'بستن تیکت' },
]

interface Props {
  ticketId: string
  currentStatus: string
  isAssigned: boolean
  isAssignedToMe: boolean
  staffId: string
  isClosed: boolean
}

export default function AdminTicketActions({
  ticketId, currentStatus, isAssigned, isClosed,
}: Props) {
  const router = useRouter()
  const [reply, setReply] = useState('')
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleAssign() {
    setAssignLoading(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('تیکت به شما assign شد')
        router.refresh()
      } else {
        setError(data.error || 'خطا')
      }
    } catch {
      setError('خطای اتصال')
    }
    setAssignLoading(false)
  }

  async function handleSubmit() {
    if (!reply.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // ارسال پاسخ
      const replyRes = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply }),
      })
      const replyData = await replyRes.json()
      if (!replyData.success) {
        setError(replyData.error || 'خطا در ارسال پاسخ')
        setLoading(false)
        return
      }

      // آپدیت وضعیت اگه تغییر کرده
      if (newStatus !== currentStatus) {
        await fetch(`/api/tickets/${ticketId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      }

      setReply('')
      setSuccess('پاسخ ارسال شد')
      router.refresh()
    } catch {
      setError('خطای اتصال')
    }
    setLoading(false)
  }

  async function handleStatusChange(status: string) {
    setNewStatus(status)
    if (!reply.trim()) {
      // فقط وضعیت رو آپدیت کن
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(`وضعیت به "${STATUS_OPTIONS.find(s => s.val === status)?.label}" تغییر کرد`)
        router.refresh()
      }
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-card-head">
        <div className="admin-card-title">پاسخ و مدیریت</div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Assign */}
        {!isAssigned && !isClosed && (
          <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 12.5, color: 'var(--yellow)' }}>این تیکت هنوز به کسی assign نشده</span>
            <button
              onClick={handleAssign}
              disabled={assignLoading}
              style={{ padding: '6px 14px', background: 'var(--yellow)', color: '#000', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
              {assignLoading ? 'در حال...' : 'قبول تیکت'}
            </button>
          </div>
        )}

        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        {success && <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, fontSize: 12.5, color: 'var(--green)' }}>{success}</div>}

        {!isClosed && (
          <>
            {/* Status */}
            <div>
              <label className="admin-label">تغییر وضعیت</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(s => (
                  <button key={s.val}
                    onClick={() => handleStatusChange(s.val)}
                    style={{
                      padding: '5px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 700,
                      background: newStatus === s.val ? 'var(--gold)' : 'var(--b2)',
                      color: newStatus === s.val ? '#000' : 'var(--t2)',
                      border: `1px solid ${newStatus === s.val ? 'var(--gold)' : 'rgba(255,255,255,0.06)'}`,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply */}
            <div>
              <label className="admin-label">متن پاسخ</label>
              <textarea
                className="admin-input"
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="پاسخ به مشتری را اینجا بنویسید..."
                rows={6}
                style={{ resize: 'vertical', lineHeight: 1.8 }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !reply.trim()}
              className="admin-btn admin-btn-gold"
              style={{ opacity: (loading || !reply.trim()) ? 0.6 : 1 }}>
              {loading ? 'در حال ارسال...' : 'ارسال پاسخ'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
