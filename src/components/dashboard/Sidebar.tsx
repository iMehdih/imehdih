// src/components/dashboard/Sidebar.tsx
import PanelSidebar, { NavSection } from '@/components/layout/PanelSidebar'

interface Props {
  user: {
    firstName: string
    lastName: string
    mobile: string
    isVIP: boolean
    customerScore: number
  }
}

const navSections: NavSection[] = [
  {
    items: [
      { href: '/dashboard', label: 'داشبورد', icon: '⬡', exact: true },
      { href: '/dashboard/orders', label: 'سفارشات', icon: '◈' },
      { href: '/dashboard/downloads', label: 'دانلودها', icon: '↓' },
      { href: '/dashboard/courses', label: 'دوره‌ها', icon: '▶' },
      { href: '/dashboard/subscription', label: 'اشتراک Pro', icon: '✦' },
      { href: '/dashboard/hosting', label: 'هاست‌ها', icon: '◉' },
      { href: '/dashboard/domains', label: 'دامنه‌ها', icon: '◎' },
      { href: '/dashboard/tickets', label: 'تیکت‌ها', icon: '✉' },
      { href: '/dashboard/notifications', label: 'اعلان‌ها', icon: '◆' },
      { href: '/dashboard/invoices', label: 'فاکتورها', icon: '▣' },
      { href: '/dashboard/profile', label: 'پروفایل', icon: '◐' },
    ],
  },
]

export default function DashboardSidebar({ user }: Props) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.mobile
  const avatarChar = user.firstName ? user.firstName[0] : user.mobile[2]

  return (
    <PanelSidebar
      role="dashboard"
      sections={navSections}
      user={{
        displayName: name,
        sub: user.mobile,
        avatarChar,
        badge: user.isVIP ? 'VIP' : undefined,
      }}
      showBackToSite
    />
  )
}
