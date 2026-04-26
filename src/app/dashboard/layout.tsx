// src/app/dashboard/layout.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import DashboardTopbar from '@/components/dashboard/Topbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')

  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  await connectDB()
  const user = await User.findById(payload.userId).select('firstName lastName mobile isProfileComplete isVIP customerScore')
  if (!user) redirect('/auth/login')
  if (!user.isProfileComplete) redirect('/dashboard/complete-profile')

  const userData = {
    id: user._id.toString(),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    mobile: user.mobile,
    isVIP: user.isVIP,
    customerScore: user.customerScore,
  }

  return (
    <div className="dashboard-root">
      <DashboardSidebar user={userData} />
      <div className="dashboard-main">
        <DashboardTopbar user={userData} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  )
}
