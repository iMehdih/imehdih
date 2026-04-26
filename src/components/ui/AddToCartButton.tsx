// src/components/ui/AddToCartButton.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  productId: string
  title: string
  price: number
  isFree: boolean
}

export default function AddToCartButton({ productId, title, price, isFree }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleAdd() {
    if (added) { router.push('/cart'); return }
    setLoading(true)
    try {
      // Cart در localStorage نگه می‌داریم
      const cartRaw = localStorage.getItem('hp_cart')
      const cart = cartRaw ? JSON.parse(cartRaw) : []
      const exists = cart.find((i: any) => i.productId === productId)
      if (!exists) {
        cart.push({ productId, title, price })
        localStorage.setItem('hp_cart', JSON.stringify(cart))
      }
      setAdded(true)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        onClick={handleAdd}
        disabled={loading}
        className="site-btn site-btn-gold"
        style={{ justifyContent: 'center', fontSize: 15, padding: '13px', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'در حال افزودن...' : added ? '✓ مشاهده سبد خرید ←' : isFree ? '↓ دانلود رایگان' : '🛒 افزودن به سبد'}
      </button>
      {added && (
        <button onClick={() => router.push('/cart')} className="site-btn site-btn-outline" style={{ justifyContent: 'center', fontSize: 13 }}>
          ادامه خرید
        </button>
      )}
    </div>
  )
}
