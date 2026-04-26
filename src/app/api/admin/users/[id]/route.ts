import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import { requireRole } from '@/lib/auth/middleware'
import { writeAuditLog } from '@/lib/utils/audit'
import { z } from 'zod'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(req, ['admin'])
    const { id } = await params
    await connectDB()

    const user = await User.findById(id).select('-otp -otpExpires').lean()
    if (!user) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 })

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

const updateSchema = z.object({
  role: z.enum(['customer', 'staff', 'admin']).optional(),
  isActive: z.boolean().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  salary: z.number().min(0).optional(),
  departments: z.array(z.string()).optional(),
  isVIP: z.boolean().optional(),
  resetOtp: z.boolean().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, ['admin'])
    const { id } = await params
    const body = await req.json()
    const updates = updateSchema.parse(body)

    await connectDB()

    const before = await User.findById(id).select('-otp -otpExpires').lean()
    if (!before) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 })

    // Prevent admin from deactivating themselves
    if (id === auth.userId && updates.isActive === false) {
      return NextResponse.json({ success: false, error: 'نمی‌توانید حساب خود را غیرفعال کنید' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (updates.role !== undefined) updateData.role = updates.role
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive
    if (updates.firstName !== undefined) updateData.firstName = updates.firstName
    if (updates.lastName !== undefined) updateData.lastName = updates.lastName
    if (updates.email !== undefined) updateData.email = updates.email || undefined
    if (updates.salary !== undefined) updateData.salary = updates.salary
    if (updates.departments !== undefined) updateData.departments = updates.departments
    if (updates.isVIP !== undefined) updateData.isVIP = updates.isVIP
    if (updates.resetOtp) {
      updateData.otp = undefined
      updateData.otpExpires = undefined
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-otp -otpExpires').lean()

    await writeAuditLog({
      userId: auth.userId, userRole: auth.role,
      action: 'update_user', entity: 'user',
      entityId: id,
      before: before as Record<string, unknown>,
      after: updateData, req,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
