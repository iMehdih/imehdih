// src/components/staff/StaffSidebar.tsx
import PanelSidebar, { NavSection } from '@/components/layout/PanelSidebar'

const sections: NavSection[] = [
  {
    items: [
      { href: '/staff', label: 'داشبورد', icon: '⬡', exact: true },
      { href: '/staff/projects/available', label: 'پروژه‌های موجود', icon: '◈' },
      { href: '/staff/projects', label: 'پروژه‌های من', icon: '◉' },
      { href: '/staff/tickets', label: 'تیکت‌ها', icon: '✉' },
      { href: '/staff/customers', label: 'مشتریان', icon: '◎' },
      { href: '/staff/blog', label: 'وبلاگ', icon: '▶' },
      { href: '/staff/leaderboard', label: 'لیدربورد', icon: '▲' },
      { href: '/staff/performance', label: 'عملکرد من', icon: '◆' },
      { href: '/staff/wallet', label: 'کیف پول', icon: '✦' },
      { href: '/staff/notifications', label: 'اعلان‌ها', icon: '◐' },
    ],
  },
]

export default function StaffSidebar({ staffId: _ }: { staffId: string }) {
  return (
    <PanelSidebar
      role="staff"
      sections={sections}
      user={{
        displayName: 'پنل کارمند',
        sub: 'Staff',
        avatarChar: 'ک',
        avatarStyle: { background: 'linear-gradient(135deg,#60A5FA,#2563EB)', color: '#fff' },
      }}
    />
  )
}
