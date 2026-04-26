// src/app/(public)/cart/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CartItem { productId: string; title: string; price: number }

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hp_cart')
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  function removeItem(productId: string) {
    const newItems = items.filter(i => i.productId !== productId)
    setItems(newItems)
    localStorage.setItem('hp_cart', JSON.stringify(newItems))
  }

  const subtotal = items.reduce((s, i) => s + i.price, 0)
  const final = Math.max(0, subtotal - discount)

  async function applyCoupon() {
    if (!coupon.trim()) return
    setCouponMsg('')
    try {
      const res = await fetch('/api/orders/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon, items: items.map(i => ({ productId: i.productId, price: i.price })), subtotal }),
      })
      const data = await res.json()
      if (data.success) {
        setDiscount(data.data.discountAmount)
        setCouponMsg(`✓ کوپن اعمال شد — ${data.data.discountAmount.toLocaleString('fa')} تومان تخفیف`)
      } else {
        setCouponMsg(data.error || 'کوپن نامعتبر')
        setDiscount(0)
      }
    } catch { setCouponMsg('خطای اتصال') }
  }

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: 1 })),
          couponCode: coupon || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.data.free) {
          localStorage.removeItem('hp_cart')
          router.push('/dashboard/orders?payment=success')
        } else if (data.data.paymentUrl) {
          localStorage.removeItem('hp_cart')
          window.location.href = data.data.paymentUrl
        }
      } else {
        alert(data.error || 'خطا در ثبت سفارش')
      }
    } catch { alert('خطای اتصال') }
    setLoading(false)
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>سبد خرید خالی است</h2>
        <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28 }}>محصول مورد نظر را اضافه کنید</p>
        <a href="/themes" className="site-btn site-btn-gold" style={{ fontSize: 14 }}>مشاهده محصولات ←</a>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '32px 28px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>سبد خرید</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => (
            <div key={item.productId} style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 11, background: 'var(--b2)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>▣</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--t3)' }}>محصول دیجیتال</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--gold)' }}>
                  {item.price === 0 ? 'رایگان' : `${item.price.toLocaleString('fa')} ت`}
                </div>
                <button onClick={() => removeItem(item.productId)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 12, fontFamily: 'inherit', marginTop: 4 }}>
                  حذف
                </button>
              </div>
            </div>
          ))}

          {/* Coupon */}
          <div style={{ background: 'var(--b1)', border: '1px solid var(--bd)', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>کد تخفیف</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="filter-search"
                value={coupon}
                onChange={e => setCoupon(e.target.value.toUpperCase())}
                placeholder="کد تخفیف..."
                style={{ flex: 1, fontSize: 13 }}
              />
              <button onClick={applyCoupon} className="site-btn site-btn-outline" style={{ fontSize: 13 }}>اعمال</button>
            </div>
            {couponMsg && (
              <div style={{ fontSize: 12.5, marginTop: 8, color: couponMsg.startsWith('✓') ? '#22C55E' : '#EF4444' }}>
                {couponMsg}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'var(--b1)', border: '1px solid var(--bd2)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--bd)', fontSize: 14, fontWeight: 800 }}>خلاصه سفارش</div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--t2)' }}>جمع ({items.length} محصول)</span>
                <span>{subtotal.toLocaleString('fa')} ت</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--t2)' }}>تخفیف کوپن</span>
                  <span style={{ color: '#22C55E' }}>-{discount.toLocaleString('fa')} ت</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 900 }}>
                <span>قابل پرداخت</span>
                <span style={{ color: 'var(--gold)' }}>{final.toLocaleString('fa')} ت</span>
              </div>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={handleCheckout} disabled={loading} className="site-btn site-btn-gold" style={{ justifyContent: 'center', fontSize: 15, padding: '13px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'در حال پردازش...' : '💳 پرداخت آنلاین'}
              </button>
              <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <span style={{ color: '#22C55E' }}>🔒</span>
                پرداخت امن از طریق زرین‌پال
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['دانلود فوری بعد از پرداخت', 'ضمانت بازگشت وجه', 'فاکتور رسمی'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--t2)' }}>
                <span style={{ color: '#22C55E' }}>✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
