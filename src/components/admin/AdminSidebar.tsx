// src/components/admin/AdminSidebar.tsx
import PanelSidebar, { NavSection } from '@/components/layout/PanelSidebar'

const sections: NavSection[] = [
  {
    label: 'اصلی',
    items: [{ href: '/admin', label: 'داشبورد', icon: '⬡', exact: true }],
  },
  {
    label: 'فروش',
    items: [
      { href: '/admin/orders', label: 'سفارشات', icon: '◈' },
      { href: '/admin/products', label: 'محصولات', icon: '▣' },
      { href: '/admin/categories', label: 'دسته‌بندی‌ها', icon: '◇' },
      { href: '/admin/coupons', label: 'کوپن‌ها', icon: '◆' },
    ],
  },
  {
    label: 'عملیات',
    items: [
      { href: '/admin/projects', label: 'پروژه‌ها', icon: '◉' },
      { href: '/admin/process-engine', label: 'Process Engine', icon: '⚙' },
      { href: '/admin/tickets', label: 'تیکت‌ها', icon: '✉' },
    ],
  },
  {
    label: 'کاربران',
    items: [
      { href: '/admin/customers', label: 'مشتریان', icon: '◎' },
      { href: '/admin/staff', label: 'کارمندان', icon: '◐' },
    ],
  },
  {
    label: 'مالی',
    items: [
      { href: '/admin/finance', label: 'داشبورد مالی', icon: '▲' },
      { href: '/admin/invoices', label: 'فاکتورها', icon: '▣' },
      { href: '/admin/wallet', label: 'کیف پول کارمندان', icon: '◆' },
      { href: '/admin/expenses', label: 'هزینه‌ها', icon: '▼' },
    ],
  },
  {
    label: 'زیرساخت',
    items: [
      { href: '/admin/hosting', label: 'هاست‌ها', icon: '◉' },
      { href: '/admin/domains', label: 'دامنه‌ها', icon: '◎' },
    ],
  },
  {
    label: 'سیستم',
    items: [
      { href: '/admin/notifications', label: 'اعلان‌ها', icon: '◆' },
      { href: '/admin/blog', label: 'وبلاگ', icon: '▶' },
      { href: '/admin/audit', label: 'Audit Log', icon: '▣' },
      { href: '/admin/settings', label: 'تنظیمات', icon: '⚙' },
    ],
  },
]

export default function AdminSidebar() {
  return (
    <PanelSidebar
      role="admin"
      sections={sections}
      user={{ displayName: 'مهدی حاتم‌پور', sub: 'ادمین', avatarChar: 'م' }}
    />
  )
}
