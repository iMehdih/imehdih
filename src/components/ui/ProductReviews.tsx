// src/components/ui/ProductReviews.tsx
'use client'
import { useState } from 'react'

interface Review {
  _id: string
  rating: number
  title?: string
  body: string
  isVerifiedPurchase: boolean
  createdAt: string
  userId: { firstName?: string; lastName?: string }
}

interface Props {
  productId: string
  initialReviews: Review[]
  initialTotal: number
  isLoggedIn: boolean
  existingRating: number
  existingReviewCount: number
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4, direction: 'ltr' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{
            fontSize: 24,
            cursor: onChange ? 'pointer' : 'default',
            color: n <= (hover || value) ? 'var(--yellow, #f5c518)' : 'var(--bd)',
            transition: 'color .1s',
          }}
        >★</span>
      ))}
    </div>
  )
}

export default function ProductReviews({
  productId,
  initialReviews,
  initialTotal,
  isLoggedIn,
  existingRating,
  existingReviewCount,
}: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({ rating: 0, title: '', body: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)

  async function loadMore() {
    setLoading(true)
    const next = page + 1
    const res = await fetch(`/api/reviews?productId=${productId}&page=${next}`)
    const data = await res.json()
    setReviews(r => [...r, ...data.reviews])
    setPage(next)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.rating === 0) { setFormError('لطفاً امتیاز انتخاب کنید'); return }
    if (!form.body.trim()) { setFormError('متن نظر الزامی است'); return }
    setSubmitting(true)
    setFormError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating: form.rating, title: form.title.trim() || undefined, body: form.body.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setFormSuccess(true)
        setForm({ rating: 0, title: '', body: '' })
        // prepend new review to list
        if (data.review) {
          setReviews(r => [{ ...data.review, userId: data.review.userId || { firstName: 'شما' } }, ...r])
          setTotal(t => t + 1)
        }
      } else {
        setFormError(data.error || 'خطا در ثبت نظر')
      }
    } catch {
      setFormError('خطای اتصال')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Summary */}
      {existingReviewCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 0 20px', borderBottom: '1px solid var(--bd)', marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: 'var(--gold)' }}>{existingRating.toFixed(1)}</div>
            <StarRating value={Math.round(existingRating)} />
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>{existingReviewCount} نظر</div>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {reviews.map(r => (
            <div key={r._id} style={{ background: 'var(--b2)', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: 'var(--gold)', flexShrink: 0 }}>
                    {r.userId?.firstName?.[0] || 'ک'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{r.userId?.firstName} {r.userId?.lastName}</div>
                    {r.isVerifiedPurchase && (
                      <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>✓ خریدار تأییدشده</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRating value={r.rating} />
                  <span style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                    {new Date(r.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
              {r.title && <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 5 }}>{r.title}</div>}
              <div style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.8 }}>{r.body}</div>
            </div>
          ))}

          {reviews.length < total && (
            <button onClick={loadMore} disabled={loading} className="site-btn site-btn-outline" style={{ alignSelf: 'center', fontSize: 13 }}>
              {loading ? 'در حال بارگذاری...' : 'نظرات بیشتر'}
            </button>
          )}
        </div>
      ) : (
        !formSuccess && (
          <div style={{ textAlign: 'center', padding: '24px 20px', color: 'var(--t3)', marginBottom: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>★</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>هنوز نظری ثبت نشده</div>
            <div style={{ fontSize: 12.5, marginTop: 4 }}>اولین نظر را شما بنویسید</div>
          </div>
        )
      )}

      {/* Submit form */}
      {isLoggedIn && !formSuccess && (
        <div style={{ background: 'var(--b2)', borderRadius: 14, padding: '20px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>نظر خود را بنویسید</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 8 }}>امتیاز شما</div>
              <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>
            <div>
              <input
                className="admin-input"
                placeholder="عنوان (اختیاری)"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                maxLength={100}
              />
            </div>
            <div>
              <textarea
                className="admin-input"
                placeholder="نظر خود را بنویسید..."
                rows={4}
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                maxLength={2000}
                style={{ resize: 'vertical' }}
              />
            </div>
            {formError && <div style={{ fontSize: 13, color: 'var(--red)' }}>{formError}</div>}
            <button type="submit" disabled={submitting} className="site-btn site-btn-gold" style={{ alignSelf: 'flex-start', fontSize: 13 }}>
              {submitting ? 'در حال ثبت...' : 'ثبت نظر'}
            </button>
          </form>
        </div>
      )}

      {formSuccess && (
        <div style={{ background: 'var(--b2)', borderRadius: 12, padding: '16px 20px', fontSize: 13.5, color: 'var(--green)', fontWeight: 700, textAlign: 'center' }}>
          ✓ نظر شما با موفقیت ثبت شد
        </div>
      )}

      {!isLoggedIn && (
        <div style={{ textAlign: 'center', padding: '16px', fontSize: 13, color: 'var(--t3)' }}>
          برای ثبت نظر <a href="/auth/login" style={{ color: 'var(--gold)' }}>وارد شوید</a>
        </div>
      )}
    </div>
  )
}
