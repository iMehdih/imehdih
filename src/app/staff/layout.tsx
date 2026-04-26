// src/app/staff/layout.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import StaffSidebar from '@/components/staff/StaffSidebar'
import StaffTopbar from '@/components/staff/StaffTopbar'

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'staff') redirect('/auth/login')

  return (
    <div className="dashboard-root">
      <StaffSidebar staffId={payload.userId} />
      <div className="dashboard-main">
        <StaffTopbar />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  )
}
