// این template رو برای همه صفحات ۴۰۴ استفاده کن
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'

export default async function DashboardPlaceholderPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  return (
    <div className="db-page">
      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">در حال توسعه...</div>
        </div>
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#505062', fontSize: 13 }}>
          این بخش در مراحل بعدی تکمیل می‌شود.
        </div>
      </div>
    </div>
  )
}
