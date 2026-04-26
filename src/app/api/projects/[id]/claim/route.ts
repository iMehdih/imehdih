// src/app/api/projects/[id]/claim/route.ts
// کارمند پروژه رو به عهده می‌گیره
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Project from '@/models/Project'
import User from '@/models/User'
import { requireRole } from '@/lib/auth/middleware'
import { notify } from '@/lib/utils/notify'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(req, ['staff', 'admin'])
    const { id } = await params
    await connectDB()

    const project = await Project.findById(id)
    if (!project) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 })

    if (project.status !== 'available') {
      return NextResponse.json({ success: false, error: 'این پروژه دیگر در دسترس نیست' }, { status: 400 })
    }

    // چک اگه پروژه اختصاصی هست
    if (project.isSpecificStaff && project.specificStaffId?.toString() !== auth.userId) {
      return NextResponse.json({ success: false, error: 'این پروژه برای کارمند دیگری اختصاص داده شده' }, { status: 403 })
    }

    await Project.findByIdAndUpdate(id, {
      assignedTo: auth.userId,
      status: 'in_progress',
    })

    // اعلان به مشتری
    if (project.customerId) {
      const staff = await User.findById(auth.userId).select('firstName lastName')
      await notify({
        userId: project.customerId.toString(),
        title: 'پروژه شروع شد',
        content: `پروژه "${project.title}" توسط ${staff?.firstName || 'کارشناس'} دریافت و شروع شد.`,
        type: 'project',
        relatedId: project._id.toString(),
        smsTemplate: 'TASK_UPDATED',
        smsTokens: {
          projectTitle: project.title,
          link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
