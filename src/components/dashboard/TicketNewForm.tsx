// src/components/dashboard/TicketNewForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// دپارتمان‌ها و تنظیماتشون
const DEPARTMENTS = [
  { id: 'support_theme_plugin', label: 'پشتیبانی قالب و افزونه', icon: '▣', needsProduct: true, checkSupport: true },
  { id: 'support_course', label: 'پشتیبانی دوره‌های آموزشی', icon: '▶', needsProduct: true, checkSupport: true },
  { id: 'support_hosting_domain', label: 'پشتیبانی هاست و دامنه', icon: '◉', needsProduct: true, checkSupport: true },
  { id: 'support_service', label: 'پشتیبانی خدمات', icon: '◎', needsProduct: true, checkSupport: true },
  { id: 'support_subscription', label: 'پشتیبانی اشتراک Pro', icon: '✦', needsProduct: true, checkSupport: true },
  { id: 'finance', label: 'واحد مالی', icon: '▲', needsProduct: false, checkSupport: false },
  { id: 'service_support', label: 'پشتیبانی خدمات پروژه‌ای', icon: '◈', needsProduct: false, checkSupport: false },
  { id: 'presale', label: 'سوالات پیش از خرید', icon: '?', needsProduct: false, checkSupport: false },
  { id: 'management', label: 'ارتباط با مدیریت', icon: '◐', needsProduct: false, checkSupport: false },
]

interface Order {
  _id: string
  orderNumber: string
  items: { productId: string; title: string; productType: string }[]
  status: string
  paidAt?: string
}

interface Props {
  userId: string
  orders: Order[]
}

type Step = 'department' | 'product' | 'compose'

export default function TicketNewForm({ orders }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('department')
  const [selectedDept, setSelectedDept] = useState<typeof DEPARTMENTS[0] | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedItem, setSelectedItem] = useState<Order['items'][0] | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // فیلتر سفارشات بر اساس دپارتمان
  const filteredOrders = orders.filter(order => {
    if (!selectedDept?.needsProduct) return false
    const typeMap: Record<string, string[]> = {
      support_theme_plugin: ['theme', 'plugin'],
      support_course: ['course'],
      support_hosting_domain: ['hosting', 'domain'],
      support_service: ['service_project', 'service_recurring'],
      support_subscription: ['subscription_pro'],
    }
    const allowedTypes = typeMap[selectedDept.id] || []
    return order.items.some(i => allowedTypes.includes(i.productType)) &&
      ['completed', 'in_progress'].includes(order.status)
  })

  function selectDept(dept: typeof DEPARTMENTS[0]) {
    setSelectedDept(dept)
    setSelectedOrder(null)
    setSelectedItem(null)
    if (dept.needsProduct) {
      setStep('product')
    } else {
      setStep('compose')
    }
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      setError('عنوان و متن تیکت الزامی است')
      return
    }
    if (!selectedDept) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: selectedDept.id,
          relatedOrderId: selectedOrder?._id,
          relatedProductId: selectedItem?.productId,
          relatedProductType: selectedItem?.productType,
          title,
          content,
        }),
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/dashboard/tickets/${data.data.ticketId}?created=1`)
      } else {
        setError(data.error || 'خطا در ثبت تیکت')
      }
    } catch {
      setError('خطای اتصال')
    }

    setLoading(false)
  }

  return (
    <div className="db-page">
      {/* Progress Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden' }}>
        {['انتخاب دپارتمان', 'انتخاب محصول', 'ثبت تیکت'].map((s, i) => {
          const stepId = (['department', 'product', 'compose'] as Step[])[i]
          const isActive = step === stepId
          const isDone = (step === 'product' && i === 0) ||
            (step === 'compose' && i <= 1)
          const isSkipped = !selectedDept?.needsProduct && i === 1

          return (
            <div key={s} style={{
              flex: 1, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8,
              background: isActive ? 'rgba(200,169,110,0.1)' : isDone ? 'rgba(34,197,94,0.05)' : 'transparent',
              borderLeft: i < 2 ? '1px solid var(--bd)' : 'none',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 900,
                background: isActive ? 'var(--gold)' : isDone ? 'var(--green)' : isSkipped ? 'var(--b3)' : 'var(--b3)',
                color: (isActive || isDone) ? '#000' : 'var(--t3)',
              }}>
                {isDone ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: isActive ? 'var(--gold)' : isDone ? 'var(--green)' : 'var(--t3)' }}>
                {isSkipped ? <s style={{ color: 'var(--t3)' }}>{s}</s> : s}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── STEP 1: Department ── */}
      {step === 'department' && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 16 }}>دپارتمان مورد نظر را انتخاب کنید</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {DEPARTMENTS.map(dept => (
              <div key={dept.id}
                onClick={() => selectDept(dept)}
                style={{
                  background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12,
                  padding: '20px 16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,169,110,0.35)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 10, color: 'var(--gold)' }}>{dept.icon}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t)', lineHeight: 1.4 }}>{dept.label}</div>
                {dept.checkSupport && (
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 6 }}>نیاز به پشتیبانی فعال</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Product Selection ── */}
      {step === 'product' && selectedDept && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <button onClick={() => { setStep('department'); setSelectedDept(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
              ← بازگشت
            </button>
            <div style={{ fontSize: 15, fontWeight: 900 }}>
              محصول یا خدمت مرتبط با تیکت را انتخاب کنید
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="db-card">
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, color: 'var(--b3)', marginBottom: 12 }}>◈</div>
                <div style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 16 }}>
                  هیچ محصول یا خدمتی برای این دپارتمان یافت نشد.
                  <br />
                  <span style={{ fontSize: 12 }}>برای این دپارتمان باید خرید فعال داشته باشید.</span>
                </div>
                <button onClick={() => setStep('department')} className="db-btn db-btn-outline">
                  بازگشت
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredOrders.map(order =>
                order.items
                  .filter(item => {
                    const typeMap: Record<string, string[]> = {
                      support_theme_plugin: ['theme', 'plugin'],
                      support_course: ['course'],
                      support_hosting_domain: ['hosting', 'domain'],
                      support_service: ['service_project', 'service_recurring'],
                      support_subscription: ['subscription_pro'],
                    }
                    return (typeMap[selectedDept.id] || []).includes(item.productType)
                  })
                  .map(item => (
                    <div key={`${order._id}-${item.productId}`}
                      onClick={() => {
                        setSelectedOrder(order)
                        setSelectedItem(item)
                        setStep('compose')
                      }}
                      style={{
                        background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 12,
                        padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,169,110,0.35)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--gold)', flexShrink: 0 }}>
                        {selectedDept.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--t3)', display: 'flex', gap: 10 }}>
                          <span>سفارش #{order.orderNumber}</span>
                          {order.paidAt && <span>{new Date(order.paidAt).toLocaleDateString('fa-IR')}</span>}
                        </div>
                      </div>
                      <div style={{ color: 'var(--gold)', fontSize: 18 }}>←</div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Compose ── */}
      {step === 'compose' && selectedDept && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <button
              onClick={() => setStep(selectedDept.needsProduct ? 'product' : 'department')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
              ← بازگشت
            </button>
            <div style={{ fontSize: 15, fontWeight: 900 }}>اطلاعات تیکت را وارد کنید</div>
          </div>

          {/* خلاصه انتخاب‌ها */}
          <div style={{ background: 'rgba(200,169,110,0.06)', border: '1px solid rgba(200,169,110,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12.5 }}>
              <span style={{ color: 'var(--t3)' }}>دپارتمان: </span>
              <strong style={{ color: 'var(--gold)' }}>{selectedDept.label}</strong>
            </div>
            {selectedItem && (
              <div style={{ fontSize: 12.5 }}>
                <span style={{ color: 'var(--t3)' }}>محصول: </span>
                <strong style={{ color: 'var(--t)' }}>{selectedItem.title}</strong>
              </div>
            )}
            {selectedOrder && (
              <div style={{ fontSize: 12.5 }}>
                <span style={{ color: 'var(--t3)' }}>سفارش: </span>
                <strong style={{ color: 'var(--t)' }}>#{selectedOrder.orderNumber}</strong>
              </div>
            )}
          </div>

          {error && (
            <div className="db-alert db-alert-error" style={{ marginBottom: 16 }}>{error}</div>
          )}

          <div className="db-card">
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="db-label">عنوان تیکت <span style={{ color: 'var(--red)' }}>*</span></label>
                <input
                  className="db-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مشکل را به طور خلاصه بنویسید..."
                  maxLength={200}
                />
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4, textAlign: 'left' }}>
                  {title.length}/200
                </div>
              </div>

              <div>
                <label className="db-label">توضیحات کامل <span style={{ color: 'var(--red)' }}>*</span></label>
                <textarea
                  className="db-input"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="مشکل یا سوال خود را با جزئیات کامل بنویسید..."
                  rows={8}
                  style={{ resize: 'vertical', lineHeight: 1.8 }}
                />
              </div>

              <div style={{ paddingTop: 16, borderTop: '1px solid var(--bd)', display: 'flex', gap: 10 }}>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !title.trim() || !content.trim()}
                  className="db-btn db-btn-gold"
                  style={{ fontSize: 14, padding: '12px 32px', opacity: (loading || !title.trim() || !content.trim()) ? 0.6 : 1 }}
                >
                  {loading ? 'در حال ثبت...' : 'ثبت تیکت'}
                </button>
                <div style={{ fontSize: 12, color: 'var(--t3)', display: 'flex', alignItems: 'center' }}>
                  پاسخ معمولاً ظرف ۴۵ دقیقه ارائه می‌شود
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
