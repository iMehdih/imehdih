// src/components/dashboard/Topbar.tsx — نسخه نهایی با bell + theme
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'
import NotificationBell from '@/components/ui/NotificationBell'

const pageTitles: Record<string, string> = {
  '/dashboard': 'داشبورد',
  '/dashboard/orders': 'سفارشات',
  '/dashboard/downloads': 'دانلودها',
  '/dashboard/courses': 'دوره‌های من',
  '/dashboard/subscription': 'اشتراک Pro',
  '/dashboard/hosting': 'هاست‌ها',
  '/dashboard/domains': 'دامنه‌ها',
  '/dashboard/tickets': 'تیکت‌ها',
  '/dashboard/notifications': 'اعلان‌ها',
  '/dashboard/invoices': 'فاکتورها',
  '/dashboard/profile': 'پروفایل',
}

export default function DashboardTopbar({ user }: { user: { firstName: string; isVIP: boolean } }) {
  const pathname = usePathname()
  const title = pageTitles[pathname] || 'پنل کاربری'

  return (
    <header className="db-topbar">
      <div className="db-topbar-title">{title}</div>
      <div className="db-topbar-acts">
        <ThemeSwitcher />
        <NotificationBell href="/dashboard/notifications" />
        <Link href="/dashboard/tickets/new" className="db-topbar-btn">
          + تیکت جدید
        </Link>
      </div>
    </header>
  )
}
