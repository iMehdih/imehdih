import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'

export default async function AdminPlaceholderPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')
  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-card-head"><div className="admin-card-title">در حال توسعه...</div></div>
        <div style={{padding:'40px 20px',textAlign:'center',color:'var(--t3)',fontSize:13}}>این بخش در مراحل بعدی تکمیل می‌شود.</div>
      </div>
    </div>
  )
}
