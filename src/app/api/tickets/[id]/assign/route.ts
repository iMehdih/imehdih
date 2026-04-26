// src/app/api/tickets/[id]/assign/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Ticket from '@/models/Ticket'
import { requireAuth } from '@/lib/auth/middleware'
import { notify } from '@/lib/utils/notify'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req)
    if (auth.role === 'customer') {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 })
    }

    const { id } = await params
    await connectDB()

    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'تیکت یافت نشد' }, { status: 404 })
    }

    if (ticket.assignedTo) {
      return NextResponse.json({
        success: false,
        error: 'این تیکت قبلاً assign شده است',
      }, { status: 400 })
    }

    ticket.assignedTo = new (require('mongoose').Types.ObjectId)(auth.userId)
    ticket.status = 'in_review'
    await ticket.save()

    // اعلان به مشتری
    await notify({
      userId: ticket.userId.toString(),
      title: 'تیکت در حال بررسی',
      content: `تیکت #${ticket.ticketNumber} توسط کارشناس پشتیبانی دریافت شد.`,
      type: 'ticket',
      relatedId: ticket._id.toString(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
