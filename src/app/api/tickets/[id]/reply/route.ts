// src/app/api/tickets/[id]/reply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Ticket from '@/models/Ticket'
import { requireAuth } from '@/lib/auth/middleware'
import { notify } from '@/lib/utils/notify'
import { z } from 'zod'

const schema = z.object({
  content: z.string().min(1, 'متن پیام الزامی است'),
  attachments: z.array(z.string()).default([]),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req)
    const { id } = await params
    const body = await req.json()
    const { content, attachments } = schema.parse(body)

    await connectDB()

    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'تیکت یافت نشد' }, { status: 404 })
    }

    // مشتری فقط تیکت خودش رو میتونه پاسخ بده
    if (auth.role === 'customer' && ticket.userId.toString() !== auth.userId) {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 })
    }

    // تیکت بسته نمیتونه جواب بگیره
    if (['closed', 'cancelled'].includes(ticket.status)) {
      return NextResponse.json({
        success: false,
        error: 'این تیکت بسته شده و قابل پاسخ‌دهی نیست. لطفاً تیکت جدید باز کنید.',
      }, { status: 400 })
    }

    // اضافه کردن پیام
    ticket.messages.push({
      _id: new (require('mongoose').Types.ObjectId)(),
      senderId: new (require('mongoose').Types.ObjectId)(auth.userId),
      senderRole: auth.role,
      content,
      attachments,
      createdAt: new Date(),
    })

    // آپدیت وضعیت بر اساس فرستنده
    if (auth.role === 'customer') {
      ticket.status = 'in_review'
    } else {
      ticket.status = 'answered'
      // reset auto-close timer
      ticket.autoCloseAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
    }

    await ticket.save()

    // اعلان
    if (auth.role !== 'customer') {
      // کارمند پاسخ داد → اعلان به مشتری
      await notify({
        userId: ticket.userId.toString(),
        title: 'پاسخ تیکت',
        content: `تیکت #${ticket.ticketNumber} پاسخ داده شد.`,
        type: 'ticket',
        relatedId: ticket._id.toString(),
        smsTemplate: 'TICKET_REPLIED',
        smsTokens: {
          ticketNumber: ticket.ticketNumber,
          link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets/${ticket._id}`,
        },
      })
    } else if (ticket.assignedTo) {
      // مشتری پاسخ داد → اعلان به کارمند assigned
      await notify({
        userId: ticket.assignedTo.toString(),
        title: 'پاسخ مشتری',
        content: `مشتری به تیکت #${ticket.ticketNumber} پاسخ داد.`,
        type: 'ticket',
        relatedId: ticket._id.toString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
