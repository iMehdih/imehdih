// src/app/api/tickets/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Ticket from '@/models/Ticket'
import { requireRole } from '@/lib/auth/middleware'
import { z } from 'zod'

const schema = z.object({
  status: z.enum([
    'open', 'in_review', 'waiting_info', 'in_progress',
    'answered', 'special_handling', 'waiting_payment',
    'resolved_pending_confirm', 'closed', 'cancelled',
  ]),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(req, ['admin', 'staff'])
    const { id } = await params
    const body = await req.json()
    const { status } = schema.parse(body)

    await connectDB()

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status, ...(status === 'closed' ? { closedAt: new Date() } : {}) },
      { new: true }
    )

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'تیکت یافت نشد' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { status: ticket.status } })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
