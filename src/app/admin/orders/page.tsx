// src/app/admin/orders/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Order from '@/models/Order'

const statusMap: Record<string,{label:string;cls:string}> = {
  pending_payment: { label: 'انتظار پرداخت', cls: 'yellow' },
  paid: { label: 'پرداخت شده', cls: 'blue' },
  in_progress: { label: 'در انجام', cls: 'blue' },
  completed: { label: 'تکمیل', cls: 'green' },
  cancelled: { label: 'لغو', cls: 'red' },
  refunded: { label: 'مرجوع', cls: 'red' },
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  const sp = await searchParams
  const status = sp.status || ''
  const page = parseInt(sp.page || '1')
  const limit = 20

  await connectDB()
  const filter: Record<string,unknown> = {}
  if (status) filter.status = status

  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip((page-1)*limit).limit(limit)
      .populate('userId', 'firstName lastName mobile'),
    Order.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="admin-page">
      {/* Status filters */}
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {[{val:'',label:'همه'}, ...Object.entries(statusMap).map(([val,{label}]) => ({val,label}))].map(s => (
          <a key={s.val} href={`/admin/orders${s.val ? `?status=${s.val}` : ''}`}
            className={`admin-filter-btn ${status === s.val ? 'active' : ''}`}>
            {s.label}
          </a>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div className="admin-card-title">سفارشات ({total})</div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>شماره</th>
                <th>مشتری</th>
                <th>محصولات</th>
                <th>مبلغ نهایی</th>
                <th>تاریخ</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => {
                const st = statusMap[o.status] || { label: o.status, cls: 'gray' }
                const user = o.userId
                return (
                  <tr key={o._id.toString()}>
                    <td className="admin-table-mono">{o.orderNumber}</td>
                    <td>
                      <div style={{fontWeight:700}}>{user?.firstName ? `${user.firstName} ${user.lastName}` : '—'}</div>
                      <div style={{fontSize:10.5,color:'var(--t3)'}}>{user?.mobile}</div>
                    </td>
                    <td>
                      <div>{o.items[0]?.title}</div>
                      {o.items.length > 1 && <div style={{fontSize:10.5,color:'var(--t3)'}}>+{o.items.length-1} مورد دیگر</div>}
                    </td>
                    <td style={{color:'var(--gold)',fontWeight:800}}>{o.finalAmount.toLocaleString('fa')} ت</td>
                    <td style={{fontSize:11.5}}>{new Date(o.createdAt).toLocaleDateString('fa-IR')}</td>
                    <td><span className={`admin-badge admin-badge-${st.cls}`}>{st.label}</span></td>
                    <td>
                      <a href={`/admin/orders/${o._id}`} className="admin-btn-sm">جزئیات</a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{padding:'14px 16px',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:6,justifyContent:'center'}}>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
              <a key={p} href={`/admin/orders?${status?`status=${status}&`:''}page=${p}`}
                style={{padding:'5px 10px',borderRadius:7,fontSize:12,fontWeight:700,textDecoration:'none',
                  background:p===page?'var(--gold)':'var(--b2)',color:p===page?'#000':'var(--t2)',
                  border:`1px solid ${p===page?'var(--gold)':'rgba(255,255,255,0.06)'}`}}>
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
