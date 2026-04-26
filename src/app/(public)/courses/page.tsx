// src/app/(public)/courses/page.tsx
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import ArchivePage from '@/components/ui/ArchivePage'

const categoryTabs = [
  { val: 'wordpress', label: 'وردپرس' },
  { val: 'seo', label: 'سئو' },
  { val: 'design', label: 'طراحی' },
  { val: 'frontend', label: 'فرانت‌اند' },
  { val: 'marketing', label: 'بازاریابی' },
  { val: 'business', label: 'کسب‌وکار' },
]

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>
}) {
  const sp = await searchParams
  const q = sp.q || ''
  const sort = sp.sort || '-downloadCount'
  const category = sp.category || ''

  await connectDB()

  const filter: Record<string, unknown> = { isActive: true, type: 'course' }
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
  if (category) filter.category = category

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).limit(24).lean(),
    Product.countDocuments(filter),
  ])

  return (
    <ArchivePage
      title="دوره‌های آموزشی"
      subtitle="از صفر تا حرفه‌ای — با پشتیبانی مستقیم مدرس"
      basePath="/courses"
      breadcrumbLabel="دوره آموزشی"
      products={products as any[]}
      total={total}
      q={q}
      sort={sort}
      category={category}
      categoryTabs={categoryTabs}
    />
  )
}
