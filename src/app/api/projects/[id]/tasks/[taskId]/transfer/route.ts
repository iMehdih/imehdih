// src/app/api/projects/[id]/tasks/[taskId]/transfer/route.ts
// انتقال تسک به کارمند دیگه
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Project from '@/models/Project'
import User from '@/models/User'
import { requireRole } from '@/lib/auth/middleware'
import { notify } from '@/lib/utils/notify'
import { z } from 'zod'

const schema = z.object({
  toStaffId: z.string().min(1, 'کارمند مقصد الزامی است'),
  reason: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const auth = await requireRole(req, ['staff', 'admin'])
    const { id, taskId } = await params
    const body = await req.json()
    const { toStaffId, reason } = schema.parse(body)

    await connectDB()

    const project = await Project.findById(id)
    if (!project) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 })

    const targetStaff = await User.findOne({ _id: toStaffId, role: 'staff', isActive: true })
    if (!targetStaff) {
      return NextResponse.json({ success: false, error: 'کارمند مقصد یافت نشد' }, { status: 404 })
    }

    await Project.findOneAndUpdate(
      { _id: id, 'tasks._id': taskId },
      { $set: { 'tasks.$.assignedTo': toStaffId } }
    )

    await notify({
      userId: toStaffId,
      title: 'تسک جدید',
      content: `یک تسک از پروژه "${project.title}" به شما منتقل شد.${reason ? ` دلیل: ${reason}` : ''}`,
      type: 'project',
      relatedId: id,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
