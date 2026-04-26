// src/app/dashboard/profile/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import ProfileForm from '@/components/dashboard/ProfileForm'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/auth/login')

  await connectDB()
  const user = await User.findById(payload.userId).select('-otp -otpExpires').lean()
  if (!user) redirect('/auth/login')

  // serialize — plain object برای Client Component
  const userData = {
    firstName: (user.firstName as string) || '',
    lastName: (user.lastName as string) || '',
    email: (user.email as string) || '',
    mobile: user.mobile as string,
    isLegal: (user.isLegal as boolean) || false,
    companyName: (user.companyName as string) || '',
    nationalId: (user.nationalId as string) || '',
    economicCode: (user.economicCode as string) || '',
    emailNotifications: {
      orderConfirm: (user.emailNotifications as any)?.orderConfirm ?? true,
      ticketReply: (user.emailNotifications as any)?.ticketReply ?? true,
      hostingRenewal: (user.emailNotifications as any)?.hostingRenewal ?? true,
      internalMessages: (user.emailNotifications as any)?.internalMessages ?? false,
      reviewReminder: (user.emailNotifications as any)?.reviewReminder ?? true,
      newsletter: (user.emailNotifications as any)?.newsletter ?? false,
    },
  }

  return (
    <div className="db-page">
      <ProfileForm user={userData} />
    </div>
  )
}
