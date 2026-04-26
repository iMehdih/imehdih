// src/app/(public)/layout.tsx
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  let user = null

  if (token) {
    const payload = await verifyToken(token)
    if (payload) {
      user = { firstName: '', role: payload.role }
    }
  }

  return (
    <>
      <SiteHeader user={user} />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}
