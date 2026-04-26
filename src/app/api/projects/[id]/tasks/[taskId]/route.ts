// src/app/api/projects/[id]/tasks/[taskId]/route.ts
// تکمیل تسک + ذخیره فیلدها
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Project from '@/models/Project'
import { requireRole } from '@/lib/auth/middleware'
import { unlockNextTasks } from '@/lib/utils/processEngine'
import { z } from 'zod'

const schema = z.object({
  fieldValues: z.record(z.unknown()).default({}),
  action: z.enum(['save', 'complete']).default('save'),
  timeSpentMinutes: z.number().min(0).default(0),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const auth = await requireRole(req, ['staff', 'admin'])
    const { id, taskId } = await params
    const body = await req.json()
    const { fieldValues, action, timeSpentMinutes } = schema.parse(body)

    await connectDB()

    const project = await Project.findById(id)
    if (!project) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 })

    // فقط کارمند assigned میتونه تسک رو تکمیل کنه
    if (auth.role === 'staff' && project.assignedTo?.toString() !== auth.userId) {
      return NextResponse.json({ success: false, error: 'شما به این پروژه دسترسی ندارید' }, { status: 403 })
    }

    const task = project.tasks.find((t: any) => t._id.toString() === taskId)
    if (!task) return NextResponse.json({ success: false, error: 'تسک یافت نشد' }, { status: 404 })

    if (task.status === 'pending') {
      return NextResponse.json({ success: false, error: 'این تسک هنوز قفل است' }, { status: 400 })
    }

    const updateFields: Record<string, unknown> = {
      'tasks.$.fieldValues': { ...task.fieldValues, ...fieldValues },
      'tasks.$.timeSpentMinutes': (task.timeSpentMinutes || 0) + timeSpentMinutes,
    }

    if (action === 'complete') {
      // چک فیلدهای required
      const requiredFields = task.fields?.filter((f: any) => f.required) || []
      for (const field of requiredFields) {
        const val = fieldValues[field.name] ?? task.fieldValues?.[field.name]
        if (val === undefined || val === null || val === '') {
          return NextResponse.json({
            success: false,
            error: `فیلد "${field.label}" الزامی است`,
          }, { status: 400 })
        }
      }

      updateFields['tasks.$.status'] = 'completed'
      updateFields['tasks.$.completedAt'] = new Date()
      if (!task.startedAt) {
        updateFields['tasks.$.startedAt'] = new Date()
      }
    } else if (task.status === 'unlocked') {
      updateFields['tasks.$.status'] = 'in_progress'
      if (!task.startedAt) {
        updateFields['tasks.$.startedAt'] = new Date()
      }
    }

    await Project.findOneAndUpdate(
      { _id: id, 'tasks._id': taskId },
      { $set: updateFields }
    )

    // اگه تسک تکمیل شد، تسک‌های بعدی رو آنلاک کن
    if (action === 'complete') {
      await unlockNextTasks(id, taskId)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
