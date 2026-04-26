// src/app/admin/products/[id]/edit/page.tsx
import Link from 'next/link'
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
          <Link href="/admin/products" className="admin-card-link">← بازگشت</Link>
        </div>
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>
          فرم ویرایش در مرحله بعد تکمیل می‌شود.
          <br />
          <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--b2)', borderRadius: 10, fontSize: 12, textAlign: 'right', direction: 'rtl' }}>
            <div><strong style={{ color: 'var(--gold)' }}>عنوان:</strong> {product.title}</div>
            <div><strong style={{ color: 'var(--gold)' }}>نوع:</strong> {product.type}</div>
            <div><strong style={{ color: 'var(--gold)' }}>قیمت:</strong> {product.price.toLocaleString('fa')} ت</div>
            <div><strong style={{ color: 'var(--gold)' }}>وضعیت:</strong> {product.isActive ? 'فعال' : 'غیرفعال'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}