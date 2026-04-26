// src/app/api/tickets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Ticket from '@/models/Ticket'
import { requireAuth } from '@/lib/auth/middleware'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req)
    const { id } = await params
    await connectDB()

    const ticket = await Ticket.findById(id)
      .populate('userId', 'firstName lastName mobile')
      .populate('assignedTo', 'firstName lastName')
      .lean()

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'تیکت یافت نشد' }, { status: 404 })
    }

    // مشتری فقط تیکت خودش رو میتونه ببینه
    if (auth.role === 'customer' && (ticket as any).userId?._id?.toString() !== auth.userId) {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: ticket })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
