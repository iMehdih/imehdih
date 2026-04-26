// src/app/admin/process-engine/[id]/edit/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import ServiceTemplate from '@/models/ServiceTemplate'
import TemplateBuilder from '@/components/admin/TemplateBuilder'

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  const { id } = await params
  await connectDB()

  const [products, template] = await Promise.all([
    Product.find({ isActive: true }).select('title type').sort('title').lean(),
    ServiceTemplate.findById(id).lean(),
  ])

  if (!template) redirect('/admin/process-engine')

  const serializedProducts = (products as any[]).map(p => ({
    _id: p._id.toString(),
    title: p.title,
    type: p.type,
  }))

  const serializedTemplate = JSON.parse(JSON.stringify(template))

  return <TemplateBuilder products={serializedProducts} initialData={serializedTemplate} />
}
