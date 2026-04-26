// src/components/admin/AdminTopbar.tsx — نسخه نهایی
'use client'
import { usePathname } from 'next/navigation'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'
import NotificationBell from '@/components/ui/NotificationBell'

const titles: Record<string, string> = {
  '/admin': 'داشبورد',
  '/admin/orders': 'سفارشات',
  '/admin/products': 'محصولات',
  '/admin/coupons': 'کوپن‌ها',
  '/admin/projects': 'پروژه‌ها',
  '/admin/process-engine': 'Process Engine',
  '/admin/tickets': 'تیکت‌ها',
  '/admin/customers': 'مشتریان',
  '/admin/staff': 'کارمندان',
  '/admin/finance': 'داشبورد مالی',
  '/admin/invoices': 'فاکتورها',
  '/admin/wallet': 'کیف پول کارمندان',
  '/admin/expenses': 'هزینه‌ها',
  '/admin/hosting': 'هاست‌ها',
  '/admin/domains': 'دامنه‌ها',
  '/admin/notifications': 'اعلان‌ها',
  '/admin/blog': 'وبلاگ',
  '/admin/audit': 'Audit Log',
  '/admin/settings': 'تنظیمات',
}

export default function AdminTopbar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const base = '/' + pathname.split('/').slice(1, 3).join('/')
  const title = titles[pathname] || titles[base] || 'پنل ادمین'

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">{title}</div>
      <div className="admin-topbar-right">
        <ThemeSwitcher />
        <NotificationBell href="/dashboard/notifications" />
        <div className="admin-topbar-user">
          <div className="admin-topbar-ava">م</div>
          <span>{adminName}</span>
        </div>
      </div>
    </header>
  )
}
