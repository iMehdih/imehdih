// src/app/(public)/plugins/page.tsx
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import ArchivePage from '@/components/ui/ArchivePage'

const categoryTabs = [
  { val: 'seo', label: 'سئو' },
  { val: 'ecommerce', label: 'فروشگاه' },
  { val: 'security', label: 'امنیت' },
  { val: 'performance', label: 'بهینه‌سازی' },
  { val: 'contact', label: 'تماس/فرم' },
  { val: 'backup', label: 'بکاپ' },
]

export default async function PluginsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>
}) {
  const sp = await searchParams
  const q = sp.q || ''
  const sort = sp.sort || '-rating'
  const category = sp.category || ''

  await connectDB()

  const filter: Record<string, unknown> = { isActive: true, type: 'plugin' }
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
  if (category) filter.category = category

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).limit(24).lean(),
    Product.countDocuments(filter),
  ])

  return (
    <ArchivePage
      title="افزونه‌های وردپرس"
      subtitle="تست‌شده، فارسی، سازگار با آخرین نسخه وردپرس"
      basePath="/plugins"
      breadcrumbLabel="افزونه وردپرس"
      products={products as any[]}
      total={total}
      q={q}
      sort={sort}
      category={category}
      categoryTabs={categoryTabs}
    />
  )
}
