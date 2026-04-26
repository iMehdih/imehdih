// src/app/admin/process-engine/new/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import TemplateBuilder from '@/components/admin/TemplateBuilder'

export default async function NewTemplatePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  await connectDB()
  const products = await Product.find({ isActive: true })
    .select('title type')
    .sort('title')
    .lean()

  const serialized = (products as any[]).map(p => ({
    _id: p._id.toString(),
    title: p.title,
    type: p.type,
  }))

  return <TemplateBuilder products={serialized} />
}
