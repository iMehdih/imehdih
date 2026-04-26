// src/app/api/projects/[id]/report/route.ts
// گزارش مشتری از پروژه
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Project from '@/models/Project'
import { requireAuth } from '@/lib/auth/middleware'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req)
    const { id } = await params
    await connectDB()

    const project = await Project.findById(id).populate('templateId', 'title tasks').lean()
    if (!project) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 })

    const p = project as any

    // مشتری فقط گزارش خودش رو میبینه
    if (auth.role === 'customer' && p.customerId?.toString() !== auth.userId) {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 })
    }

    if (!p.reportGenerated) {
      return NextResponse.json({ success: false, error: 'گزارش هنوز آماده نیست' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: p.reportData })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
