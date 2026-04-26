// src/app/(public)/files/page.tsx
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import ArchivePage from '@/components/ui/ArchivePage'

const categoryTabs = [
  { val: 'template', label: 'قالب آماده' },
  { val: 'mockup', label: 'موکاپ' },
  { val: 'icon', label: 'آیکون' },
  { val: 'font', label: 'فونت' },
  { val: 'document', label: 'مستندات' },
]

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>
}) {
  const sp = await searchParams
  const q = sp.q || ''
  const sort = sp.sort || '-createdAt'
  const category = sp.category || ''

  await connectDB()

  const filter: Record<string, unknown> = { isActive: true, type: 'file' }
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
  if (category) filter.category = category

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).limit(24).lean(),
    Product.countDocuments(filter),
  ])

  return (
    <ArchivePage
      title="فایل‌های دیجیتال"
      subtitle="فایل‌های آماده دانلود — تحویل فوری"
      basePath="/files"
      breadcrumbLabel="فایل دیجیتال"
      products={products as any[]}
      total={total}
      q={q}
      sort={sort}
      category={category}
      categoryTabs={categoryTabs}
    />
  )
}
