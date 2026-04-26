// src/components/staff/StaffTopbar.tsx
'use client'
import { usePathname } from 'next/navigation'
const titles: Record<string, string> = {
  '/staff': 'داشبورد کارمند',
  '/staff/projects/available': 'پروژه‌های موجود',
  '/staff/projects': 'پروژه‌های من',
  '/staff/tickets': 'تیکت‌ها',
  '/staff/customers': 'مشتریان',
  '/staff/leaderboard': 'لیدربورد',
  '/staff/performance': 'عملکرد من',
  '/staff/wallet': 'کیف پول',
}
export default function StaffTopbar() {
  const pathname = usePathname()
  const base = '/' + pathname.split('/').slice(1, 3).join('/')
  const title = titles[pathname] || titles[base] || 'پنل کارمند'
  return (
    <header className="db-topbar">
      <div className="db-topbar-title">{title}</div>
      <div className="db-topbar-acts">
        <a href="/staff/projects/available" className="db-topbar-btn">+ گرفتن پروژه</a>
      </div>
    </header>
  )
}
