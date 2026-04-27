// src/app/admin/products/new/page.tsx  (و edit هم همین)
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FileUpload from '@/components/ui/FileUpload'

const typeOptions = [
  { val: 'theme', label: 'قالب وردپرس' },
  { val: 'plugin', label: 'افزونه وردپرس' },
  { val: 'course', label: 'دوره آموزشی' },
  { val: 'file', label: 'فایل دیجیتال' },
  { val: 'service_project', label: 'خدمت پروژه‌ای' },
  { val: 'service_recurring', label: 'سرویس مستمر' },
  { val: 'hosting', label: 'هاست' },
  { val: 'domain', label: 'دامنه' },
  { val: 'subscription_pro', label: 'اشتراک Pro' },
]

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    type: 'theme', title: '', slug: '', shortDescription: '',
    description: '', price: '', salePrice: '', category: '',
    tags: '', supportDuration: '', thumbnail: '', downloadUrl: '',
    isActive: true, isFeatured: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  }

  async function handleSubmit() {
    if (!form.title || !form.slug || !form.price) {
      setError('عنوان، slug و قیمت الزامی است')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          salePrice: form.salePrice ? Number(form.salePrice) : undefined,
          supportDuration: form.supportDuration ? Number(form.supportDuration) : undefined,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/admin/products')
      } else {
        setError(data.error || 'خطا در ذخیره')
      }
    } catch {
      setError('خطای اتصال')
    }
    setLoading(false)
  }

  const inp = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }))

  return (
    <div className="admin-page">
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="admin-2col">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* اطلاعات اصلی */}
          <div className="admin-card">
            <div className="admin-card-head"><div className="admin-card-title">اطلاعات اصلی</div></div>
            <div style={{padding:20,display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <label className="admin-label">نوع محصول <span style={{color:'var(--red)'}}>*</span></label>
                <select className="admin-input" value={form.type} onChange={e => inp('type', e.target.value)}>
                  {typeOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">عنوان <span style={{color:'var(--red)'}}>*</span></label>
                <input className="admin-input" value={form.title} onChange={e => { inp('title', e.target.value); if(!form.slug) inp('slug', autoSlug(e.target.value)) }} placeholder="قالب آواتار Pro" />
              </div>
              <div>
                <label className="admin-label">Slug (URL) <span style={{color:'var(--red)'}}>*</span></label>
                <input className="admin-input" value={form.slug} onChange={e => inp('slug', e.target.value)} placeholder="avatar-pro-theme" dir="ltr" />
              </div>
              <div>
                <label className="admin-label">توضیح کوتاه</label>
                <input className="admin-input" value={form.shortDescription} onChange={e => inp('shortDescription', e.target.value)} placeholder="یک جمله توضیح..." />
              </div>
              <div>
                <label className="admin-label">توضیحات کامل</label>
                <textarea className="admin-input" rows={5} value={form.description} onChange={e => inp('description', e.target.value)} placeholder="توضیحات کامل محصول..." style={{resize:'vertical'}} />
              </div>
            </div>
          </div>

          {/* سئو */}
          <div className="admin-card">
            <div className="admin-card-head"><div className="admin-card-title">دسته‌بندی و تگ</div></div>
            <div style={{padding:20,display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <label className="admin-label">دسته‌بندی</label>
                <input className="admin-input" value={form.category} onChange={e => inp('category', e.target.value)} placeholder="shop / course / ..." />
              </div>
              <div>
                <label className="admin-label">تگ‌ها (با کاما جدا کنید)</label>
                <input className="admin-input" value={form.tags} onChange={e => inp('tags', e.target.value)} placeholder="woocommerce, فروشگاهی, rtl" />
              </div>
            </div>
          </div>
        </div>

        {/* ستون راست */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* قیمت */}
          <div className="admin-card">
            <div className="admin-card-head"><div className="admin-card-title">قیمت‌گذاری</div></div>
            <div style={{padding:20,display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <label className="admin-label">قیمت (تومان) <span style={{color:'var(--red)'}}>*</span></label>
                <input className="admin-input" type="number" value={form.price} onChange={e => inp('price', e.target.value)} placeholder="500000" dir="ltr" />
                <div style={{fontSize:11,color:'var(--t3)',marginTop:4}}>برای رایگان عدد ۰ وارد کنید</div>
              </div>
              <div>
                <label className="admin-label">قیمت با تخفیف (تومان)</label>
                <input className="admin-input" type="number" value={form.salePrice} onChange={e => inp('salePrice', e.target.value)} placeholder="اختیاری" dir="ltr" />
              </div>
              <div>
                <label className="admin-label">مدت پشتیبانی (روز)</label>
                <input className="admin-input" type="number" value={form.supportDuration} onChange={e => inp('supportDuration', e.target.value)} placeholder="180" dir="ltr" />
              </div>
            </div>
          </div>

          {/* تصویر و فایل */}
          <div className="admin-card">
            <div className="admin-card-head"><div className="admin-card-title">تصویر و فایل</div></div>
            <div style={{padding:20,display:'flex',flexDirection:'column',gap:14}}>
              <FileUpload
                value={form.thumbnail}
                onChange={url => inp('thumbnail', url)}
                label="تصویر بندانگشتی"
                bucket="products"
                folder="thumbnails"
                hint="JPG، PNG یا WebP — حداکثر ۵ مگابایت"
              />
              <FileUpload
                value={form.downloadUrl}
                onChange={url => inp('downloadUrl', url)}
                label="فایل دانلود (ZIP/PDF)"
                accept=".zip,.pdf,.rar"
                bucket="products"
                folder="files"
                previewType="none"
                hint="ZIP، PDF — حداکثر ۲۰۰ مگابایت"
              />
            </div>
          </div>

          {/* تنظیمات */}
          <div className="admin-card">
            <div className="admin-card-head"><div className="admin-card-title">تنظیمات</div></div>
            <div style={{padding:20,display:'flex',flexDirection:'column',gap:12}}>
              {[
                { field: 'isActive', label: 'محصول فعال باشد' },
                { field: 'isFeatured', label: 'نمایش به عنوان ویژه' },
              ].map(({ field, label }) => (
                <div key={field} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:13,color:'var(--t2)'}}>{label}</span>
                  <div onClick={() => setForm(f => ({ ...f, [field]: !f[field as keyof typeof f] }))}
                    style={{width:44,height:24,borderRadius:100,cursor:'pointer',transition:'background 0.2s',position:'relative',
                      background: (form as any)[field] ? 'var(--gold)' : 'var(--b3)'}}>
                    <div style={{position:'absolute',top:3,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'right 0.2s',
                      right: (form as any)[field] ? 3 : 23}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* دکمه */}
          <button onClick={handleSubmit} disabled={loading} className="admin-btn admin-btn-gold" style={{width:'100%',justifyContent:'center',fontSize:14,padding:'13px'}}>
            {loading ? 'در حال ذخیره...' : '+ ذخیره محصول'}
          </button>
          <Link href="/admin/products" className="admin-btn" style={{width:'100%',justifyContent:'center',fontSize:13,padding:'11px',background:'transparent',border:'1px solid rgba(255,255,255,0.06)',color:'var(--t2)',textDecoration:'none',display:'flex',alignItems:'center'}}>
            انصراف
          </Link>
        </div>
      </div>
    </div>
  )
}
