// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Project from '@/models/Project'
import { requireAuth } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    await connectDB()

    const { searchParams } = new URL(req.url)
    const view = searchParams.get('view') || 'mine' // mine | available | all

    let filter: Record<string, unknown> = {}

    if (auth.role === 'customer') {
      filter = { customerId: auth.userId }
    } else if (auth.role === 'staff') {
      if (view === 'available') {
        // پروژه‌های موجود که کسی نگرفته و به این کارمند اختصاصی نیست یا اختصاصی خودشه
        filter = {
          status: 'available',
          $or: [
            { isSpecificStaff: false },
            { isSpecificStaff: true, specificStaffId: auth.userId },
          ],
        }
      } else if (view === 'mine') {
        filter = { assignedTo: auth.userId }
      }
    } else if (auth.role === 'admin') {
      if (view !== 'all') filter = {}
    }

    const projects = await Project.find(filter)
      .sort('-createdAt')
      .populate('customerId', 'firstName lastName mobile')
      .populate('assignedTo', 'firstName lastName')
      .populate('templateId', 'title')
      .select('-tasks.fieldValues') // fieldValues سنگینه، در لیست لازم نیست
      .lean()

    return NextResponse.json({ success: true, data: projects })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
