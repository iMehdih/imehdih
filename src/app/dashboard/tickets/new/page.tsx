// src/app/dashboard/tickets/new/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import Order from '@/models/Order'
import TicketNewForm from '@/components/dashboard/TicketNewForm'

export default async function NewTicketPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'customer') redirect('/auth/login')

  await connectDB()

  // سفارشات تکمیل‌شده یا در حال انجام
  const orders = await Order.find({
    userId: payload.userId,
    status: { $in: ['completed', 'in_progress', 'paid'] },
  })
    .sort('-createdAt')
    .lean()

  // serialize برای Client Component
  const serializedOrders = (orders as any[]).map(o => ({
    _id: o._id.toString(),
    orderNumber: o.orderNumber,
    status: o.status,
    paidAt: o.paidAt?.toISOString(),
    items: o.items.map((i: any) => ({
      productId: i.productId?.toString(),
      title: i.title,
      productType: i.productType,
    })),
  }))

  return (
    <TicketNewForm
      userId={payload.userId}
      orders={serializedOrders}
    />
  )
}
