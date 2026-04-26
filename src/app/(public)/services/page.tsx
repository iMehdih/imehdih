// src/app/(public)/services/page.tsx
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import ArchivePage from '@/components/ui/ArchivePage'

const categoryTabs = [
  { val: 'design', label: 'طراحی سایت' },
  { val: 'seo', label: 'سئو' },
  { val: 'hosting', label: 'هاست' },
  { val: 'content', label: 'محتوا' },
  { val: 'support', label: 'پشتیبانی' },
]

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>
}) {
  const sp = await searchParams
  const q = sp.q || ''
  const sort = sp.sort || '-rating'
  const category = sp.category || ''

  await connectDB()

  const filter: Record<string, unknown> = {
    isActive: true,
    type: { $in: ['service_project', 'service_recurring'] },
  }
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
  if (category) filter.category = category

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).limit(24).lean(),
    Product.countDocuments(filter),
  ])

  return (
    <ArchivePage
      title="خدمات تخصصی"
      subtitle="پروژه‌ای یا مستمر — با ضمانت تحویل"
      basePath="/services"
      breadcrumbLabel="خدمات"
      products={products as any[]}
      total={total}
      q={q}
      sort={sort}
      category={category}
      categoryTabs={categoryTabs}
    />
  )
}
