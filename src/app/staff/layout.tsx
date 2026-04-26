// src/app/staff/layout.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import StaffSidebar from '@/components/staff/StaffSidebar'
import StaffTopbar from '@/components/staff/StaffTopbar'
import MobileMenu from '@/components/ui/MobileMenu'

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'staff') redirect('/auth/login')

  return (
    <div className="db-root">
      <StaffSidebar staffId={payload.userId} />
      <div className="db-main">
        <StaffTopbar />
        <main className="db-content">{children}</main>
      </div>
      <MobileMenu />
    </div>
  )
}
