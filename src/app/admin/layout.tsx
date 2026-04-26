// src/app/admin/layout.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopbar from '@/components/admin/AdminTopbar'
import MobileMenu from '@/components/ui/MobileMenu'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  return (
    <div className="db-root">
      <AdminSidebar />
      <div className="db-main">
        <AdminTopbar adminName="مهدی حاتم‌پور" />
        <main className="db-content">{children}</main>
      </div>
      <MobileMenu />
    </div>
  )
}
