// src/app/admin/products/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import Link from 'next/link'

const typeLabels: Record<string,string> = {
  theme: 'قالب', plugin: 'افزونه', course: 'دوره', file: 'فایل',
  service_project: 'خدمت پروژه‌ای', service_recurring: 'سرویس مستمر',
  hosting: 'هاست', domain: 'دامنه', subscription_pro: 'اشتراک Pro',
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ type?: string; page?: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  const sp = await searchParams
  const type = sp.type || ''
  const page = parseInt(sp.page || '1')
  const limit = 15

  await connectDB()
  const filter: Record<string,unknown> = {}
  if (type) filter.type = type

  const [products, total] = await Promise.all([
    Product.find(filter).sort('-createdAt').skip((page-1)*limit).limit(limit),
    Product.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="admin-page">
      {/* Filters + Actions */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:6,flex:1,flexWrap:'wrap'}}>
          {[{val:'',label:'همه'}, ...Object.entries(typeLabels).map(([val,label]) => ({val,label}))].map(t => (
            <a key={t.val} href={`/admin/products${t.val ? `?type=${t.val}` : ''}`}
              className={`admin-filter-btn ${type === t.val ? 'active' : ''}`}>
              {t.label}
            </a>
          ))}
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-gold">
          + محصول جدید
        </Link>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div className="admin-card-title">محصولات ({total})</div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>عنوان</th>
                <th>نوع</th>
                <th>قیمت</th>
                <th>فروش</th>
                <th>امتیاز</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p._id.toString()}>
                  <td>
                    <div style={{fontWeight:700}}>{p.title}</div>
                    <div style={{fontSize:10.5,color:'var(--t3)'}}>{p.slug}</div>
                  </td>
                  <td><span className="admin-badge admin-badge-gold">{typeLabels[p.type] || p.type}</span></td>
                  <td>
                    {p.salePrice ? (
                      <div>
                        <div style={{color:'var(--gold)',fontWeight:800}}>{p.salePrice.toLocaleString('fa')}</div>
                        <div style={{fontSize:10.5,color:'var(--t3)',textDecoration:'line-through'}}>{p.price.toLocaleString('fa')}</div>
                      </div>
                    ) : (
                      <div style={{color:'var(--gold)',fontWeight:800}}>
                        {p.price === 0 ? 'رایگان' : p.price.toLocaleString('fa')}
                      </div>
                    )}
                  </td>
                  <td>{p.downloadCount}</td>
                  <td>{p.rating > 0 ? `${p.rating} (${p.reviewCount})` : '—'}</td>
                  <td>
                    <span className={`admin-badge ${p.isActive ? 'admin-badge-green' : 'admin-badge-red'}`}>
                      {p.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                    {p.isFeatured && <span className="admin-badge admin-badge-gold" style={{marginRight:4}}>ویژه</span>}
                  </td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <Link href={`/admin/products/${p._id}/edit`} className="admin-btn-sm">ویرایش</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{padding:'14px 16px',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:6,justifyContent:'center'}}>
            {Array.from({length:totalPages},(_,i) => i+1).map(p => (
              <a key={p} href={`/admin/products?${type?`type=${type}&`:''}page=${p}`}
                style={{
                  padding:'5px 10px',borderRadius:7,fontSize:12,fontWeight:700,textDecoration:'none',
                  background: p === page ? 'var(--gold)' : 'var(--b2)',
                  color: p === page ? '#000' : 'var(--t2)',
                  border: `1px solid ${p === page ? 'var(--gold)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
