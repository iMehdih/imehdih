// src/app/(public)/themes/page.tsx
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import ArchivePage from '@/components/ui/ArchivePage'

const categoryTabs = [
  { val: 'shop', label: 'فروشگاهی' },
  { val: 'business', label: 'شرکتی' },
  { val: 'portfolio', label: 'پورتفولیو' },
  { val: 'blog', label: 'وبلاگ' },
  { val: 'news', label: 'خبری' },
  { val: 'education', label: 'آموزشی' },
]

export default async function ThemesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>
}) {
  const sp = await searchParams
  const q = sp.q || ''
  const sort = sp.sort || '-rating'
  const category = sp.category || ''

  await connectDB()

  const filter: Record<string, unknown> = { isActive: true, type: 'theme' }
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
  if (category) filter.category = category

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).limit(24).lean(),
    Product.countDocuments(filter),
  ])

  return (
    <ArchivePage
      title="قالب‌های وردپرس"
      subtitle="RTL کامل، ووکامرس، Elementor — با پشتیبانی رسمی"
      basePath="/themes"
      breadcrumbLabel="قالب وردپرس"
      products={products as any[]}
      total={total}
      q={q}
      sort={sort}
      category={category}
      categoryTabs={categoryTabs}
    />
  )
}
