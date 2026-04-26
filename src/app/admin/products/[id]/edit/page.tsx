// src/app/admin/products/[id]/edit/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  const { id } = await params
  await connectDB()
  const product = await Product.findById(id)
  if (!product) redirect('/admin/products')

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-card-head">
          <div className="admin-card-title">ویرایش: {product.title}</div>
          <a href="/admin/products" className="admin-card-link">← بازگشت</a>
        </div>
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#505062', fontSize: 13 }}>
          فرم ویرایش در مرحله بعد تکمیل می‌شود.
          <br />
          <div style={{ marginTop: 12, padding: '12px 16px', background: '#141420', borderRadius: 10, fontSize: 12, textAlign: 'right', direction: 'rtl' }}>
            <div><strong style={{ color: '#C8A96E' }}>عنوان:</strong> {product.title}</div>
            <div><strong style={{ color: '#C8A96E' }}>نوع:</strong> {product.type}</div>
            <div><strong style={{ color: '#C8A96E' }}>قیمت:</strong> {product.price.toLocaleString('fa')} ت</div>
            <div><strong style={{ color: '#C8A96E' }}>وضعیت:</strong> {product.isActive ? 'فعال' : 'غیرفعال'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}