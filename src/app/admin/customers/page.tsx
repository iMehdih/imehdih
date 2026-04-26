// src/app/admin/customers/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import Order from '@/models/Order'

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  const sp = await searchParams
  const page = parseInt(sp.page || '1')
  const search = sp.search || ''
  const limit = 20

  await connectDB()

  const filter: Record<string,unknown> = { role: 'customer' }
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search } },
    ]
  }

  const [customers, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip((page-1)*limit).limit(limit),
    User.countDocuments(filter),
  ])

  const customerIds = customers.map((c: any) => c._id)
  const orderStats = await Order.aggregate([
    { $match: { userId: { $in: customerIds }, status: { $in: ['paid','in_progress','completed'] } } },
    { $group: { _id: '$userId', count: { $sum: 1 }, total: { $sum: '$finalAmount' } } },
  ])
  const statsMap: Record<string,{count:number;total:number}> = {}
  orderStats.forEach((s: any) => { statsMap[s._id.toString()] = { count: s.count, total: s.total } })

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)

  return (
    <div className="admin-page">
      {/* Search */}
      <form method="GET" style={{marginBottom:16}}>
        <div style={{display:'flex',gap:8}}>
          <input className="admin-input" name="search" defaultValue={search}
            placeholder="جستجو با نام یا موبایل..." style={{maxWidth:320}} />
          <button type="submit" className="admin-btn admin-btn-gold">جستجو</button>
          {search && <a href="/admin/customers" className="admin-btn" style={{background:'transparent',border:'1px solid rgba(255,255,255,0.06)',color:'#8888A0',textDecoration:'none',display:'flex',alignItems:'center'}}>پاک کردن</a>}
        </div>
      </form>

      <div className="admin-card">
        <div className="admin-card-head">
          <div className="admin-card-title">مشتریان ({total})</div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>مشتری</th>
                <th>موبایل</th>
                <th>سفارشات</th>
                <th>مجموع خرید</th>
                <th>امتیاز</th>
                <th>آخرین بازدید</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => {
                const stats = statsMap[c._id.toString()] || { count: 0, total: 0 }
                const isOnline = c.lastSeen && new Date(c.lastSeen) > fiveMinAgo
                const lastSeen = c.lastSeen ? new Date(c.lastSeen).toLocaleDateString('fa-IR') : '—'
                return (
                  <tr key={c._id.toString()}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:9}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#C8A96E,#A8843A)',display:'flex',alignItems:'center',justifyContent:'center',color:'#000',fontWeight:900,fontSize:13,flexShrink:0}}>
                          {c.firstName ? c.firstName[0] : c.mobile[2]}
                        </div>
                        <div>
                          <div style={{fontWeight:700}}>
                            {c.firstName ? `${c.firstName} ${c.lastName}` : 'تکمیل نشده'}
                            {c.isVIP && <span className="admin-badge admin-badge-gold" style={{marginRight:5,fontSize:9}}>VIP</span>}
                          </div>
                          <div style={{fontSize:10.5,color:'#505062'}}>{c.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="admin-table-mono" style={{fontSize:12}}>{c.mobile}</td>
                    <td>{stats.count}</td>
                    <td style={{color:'#C8A96E',fontWeight:700}}>
                      {stats.total > 0 ? `${(stats.total/1000).toFixed(0)}ک` : '—'}
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <div style={{width:40,height:4,background:'#1C1C2A',borderRadius:100,overflow:'hidden'}}>
                          <div style={{width:`${c.customerScore}%`,height:'100%',background:'#C8A96E',borderRadius:100}}/>
                        </div>
                        <span style={{fontSize:10.5,color:'#505062'}}>{c.customerScore}</span>
                      </div>
                    </td>
                    <td style={{fontSize:11.5,color:'#505062'}}>{lastSeen}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <div style={{width:7,height:7,borderRadius:'50%',background:isOnline?'#22C55E':'#505062'}}/>
                        <span style={{fontSize:11,color:isOnline?'#22C55E':'#505062'}}>{isOnline?'آنلاین':'آفلاین'}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
